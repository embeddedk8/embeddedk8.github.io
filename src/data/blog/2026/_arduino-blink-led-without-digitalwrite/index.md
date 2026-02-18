---
weight: 2
title: "Blinking an LED on Arduino Uno R4 using direct register access"
slug: 'arduino-blink-led-without-digitalwrite'
pubDatetime: 2026-02-18T15:58:26+08:00
modDatetime: 2026-02-18T15:58:26+08:00
draft: true
author: "embeddedk8"
authorLink: "https://embeddedk8.com"
description: "Skip Arduino libraries and blink an LED on Arduino Uno R4 using direct registers access. We'll read RA4M1 datasheet and configure and configure a GPIO pin manually."
images: []
resources:
- name: "featured-image"
  src: "featured-image.png"

tags: ["Arduino"]
lightgallery: true
toc:
    auto: false
math:
    enable: true
---

## Table Of Contents

## Arduino way to Blink an LED

Blinking an LED on Arduino is extremely easy if you use Arduino libraries.
Let's open Blink example to see the code needed for blinking.

```
void setup() {
  // initialize digital pin LED_BUILTIN as an output.
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);  // turn the LED on (HIGH is the voltage level)
  delay(1000);                      // wait for a second
  digitalWrite(LED_BUILTIN, LOW);   // turn the LED off by making the voltage LOW
  delay(1000);                      // wait for a second
}
```

This code is doing two main things needed to blink an LED, or more generally, configure a GPIO as an output pin and set it to high or a low state:
1. Configure the pin as an output
```
   pinMode(LED_BUILTIN, OUTPUT);
```

2. Set the pin to high or low state.
```
digitalWrite(LED_BUILTIN, HIGH | LOW);
```

This code will work on any Arduino board, because the Arduino libraries will handle the hardware differences, which is pretty convenient.
But the drawback is that at the same time they are hiding all interesting stuff that is going on under the hood.
You can be an Arduino user who can blink an LED and everything, but still don't understand what is going on in the hardware.
If you want to make a step further into real embedded programming, read on! We'll try to do the same thing, but without using Arduino libraries, by reading Arduino
and CPU datasheets and configuring the GPIO pin manually.

Our goal will be to do the blinking without using `pinMode` and `digitalWrite` functions. 
For simplicity of this example, we will still use the Arduino sketch, the default Arduino setup, which is executed even before our `setup()` is called,
and `delay()` function, which is not the main focus of this post.

*So this is not a bare-metal yet, but we will be approach it :)*

## Which LED is it? First look into datasheet

Let's keep to our `LED_BUILTIN` LED, but without using the `LED_BUILTIN` macro. Let's do it like real engineers and check the pinout in [Arduino UNO R4 WiFi datasheet](https://docs.arduino.cc/resources/datasheets/ABX00087-datasheet.pdf).

![Arduino Uno R4 WiFi Pinout](@/assets/images/arduino-blink-led/pinout.png "Arduino Uno R4 WiFi Pinout, source: Arduino UNO R4 WiFi datasheet")
*Source: https://docs.arduino.cc/resources/datasheets/ABX00087-datasheet.pdf*

To understand the undercovers of Blink LED example, let's refresh the GPIO handling in embedded.

## Search for LED L in datasheet diagram

First, we need to know what PIN is responsible for our LED (LED_BUILTIN).
We don't want to use LED_BUILTIN macro.

Open the pinout page and try to locate the LED. It's also marked as LED_BUILTIN so things are clear. It gets signal from P102 pin.

![Arduino Uno R4 WiFi Pinout](@/assets/images/arduino-github-actions-with-wokwi/github-secret.png "Adding a secret to Github repository")


## Set P102 as digital output

The instruction on how to set LED without Arduino libraries will not be in Arduino datasheet - the recommended way of Arduino is to
use their libraries. Instead, we need to look into the datasheet/user manual of actual CPU that steers the LED.
```
19.5 Usage Notes
19.5.1 Procedure for Specifying the Pin Functions
To specify the I/O pin functions:
1. Clear the B0WI bit in the PWPR register. This enables writing to the PFSWE bit in the PWPR register.
2. Set 1 to the PFSWE bit in the PWPR register. This enables writing to the PmnPFS register.
3. Clear the Port Mode Control bit in the PMR for the target pin to select the general I/O port.
4. Specify the input/output function for the pin through the PSEL[4:0] bit settings in the PmnPFS register.
5. Set the PMR to 1 as required to switch to the selected input/output function for the pin.
6. Clear the PFSWE bit in the PWPR register. This disables writing to the PmnPFS register.
7. Set 1 to the B0WI bit in the PWPR register. This disables writing to the PFSWE bit in the PWPR register.
```

(source: https://edm.eeworld.com.cn/ra4m1-Users_Manual_Hardware.pdf)


Ok, let's do it slowly.

1. Clear the B0WI bit in the PWPR register. This enables writing to the PFSWE bit in the PWPR register.

How to get address of PWPR register? How to get the bit number of BOWI bit?

In above manual, let's look for PWPR register (simply by search for PWPR string). It's described in a section 19.2.6 Write-Protect Register (PWPR).
Address(es): PMISC.PWPR 40040D03h
BOWI bit is bit 7 of this register.

So, to clear BOWI bit we need to write '0' to bit 7 of address 40040D03h.

PWPR &= ~(1 << 7);

PWPR |= (1 << 6);

/home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.5.1/variants/UNOWIFIR4/includes/ra/fsp/src/bsp/cmsis/Device/RENESAS/Include

// Check datasheet
// https://docs.arduino.cc/resources/datasheets/ABX00087-datasheet.pdf
// https://edm.eeworld.com.cn/ra4m1-Users_Manual_Hardware.pdf
// Our led is LED_BUILTIN P102
// https://docs.arduino.cc/resources/datasheets/ra4m1-datasheet.pdf
//https://docs.arduino.cc/resources/datasheets/ra4m1-datasheet.pdf


https://kleinembedded.com/stm32-without-cubeide-part-1-the-bare-necessities/
https://github.com/MarcJacob/MyBareMetalLEDBlinker