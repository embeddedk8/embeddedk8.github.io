---
weight: 2
title: "Blinking an LED on Arduino Uno R4 using direct register access"
slug: 'arduino-blink-led-without-digitalwrite'
pubDatetime: 2026-02-20T15:58:26+08:00
modDatetime: 2026-02-20T15:58:26+08:00
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

Blinking an LED on Arduino is extremely easy if you use Arduino libraries. In this post, we will make the first step to leave the kindergarten. ;)

![Arduino Uno R4 WiFi Blink LED](@/assets/images/arduino-blink-led/blink.gif "Arduino Uno R4 WiFi Blink LED")

Let's open Blink example to see the code needed for blinking.

```cpp
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

This code is doing two main things needed to blink an LED:
1. Configure the GPIO pin as an output,
2. Set the pin to high or low state.

This code will work on any Arduino board, because the Arduino libraries handle the hardware differences, which is pretty convenient.
But the drawback is that at the same time they are hiding all interesting stuff that is going on under the hood.
You can be an Arduino user who can blink an LED and everything, but still don't understand what is going on in the hardware.
Additionally, we cannot assess if the implementation of Arduino libraries is efficient or not, and there are often claims about
the Arduino libraries are having unnecessary overhead, or even implementation issues ([see: Reddit](https://www.reddit.com/r/embedded/comments/mbn7nm/where_are_the_bad_arduino_libraries/)).

In order to make a step further into real embedded programming, we will to do the same thing, but without using Arduino libraries, by reading Arduino
and CPU datasheets and configuring the GPIO pin manually.

Our goal will be to do the blinking without using `pinMode` and `digitalWrite` functions. 
For simplicity of this example, we will still use the Arduino sketch, the default Arduino setup, which is executed even before our `setup()` is called,
and `delay()` function, which is not the main focus of this post. So this is not a bare-metal yet, but we will be approach it :)

## Which LED is it? First look into datasheet

Let's stick to our `LED_BUILTIN` LED, but without using the `LED_BUILTIN` macro. Let's do it like real engineers and check the pinout in [Arduino UNO R4 WiFi datasheet](https://docs.arduino.cc/resources/datasheets/ABX00087-datasheet.pdf).

![Arduino Uno R4 WiFi Pinout](@/assets/images/arduino-blink-led/pinout.png "Arduino Uno R4 WiFi Pinout, source: Arduino UNO R4 WiFi datasheet")
*Source: https://docs.arduino.cc/resources/datasheets/ABX00087-datasheet.pdf*

In the pinout diagram wer see that `LED_BUILTIN` is connected to P102 pin of microcontroller. P102 means: PORT 1, PIN 02. This will be our steering pin for blinking the LED.

## What microcontroller it is?

Ok, so we know which pin of microcontroller, but we don't know yet which microcontroller it is :). Let's go back to Arduino UNO R4 WiFi datasheet.
On the first page it gives us the exact microcontroller model: `R7FA4M1AB3CFM#AA0` from a RA4M1 series microcontroller of Renesas. 
To proceed, we need to look into the technical reference manual of this microcontroller: [Renesas RA4M1 Group User’s Manual: Hardware](https://cdn.sparkfun.com/assets/b/1/d/3/6/RA4M1_Datasheet.pdf).

When you open this manual, you are leaving the friendly Arduino ecosystem, and entering the realms of real embedded systems.
You will see more than 1400 pages of documentation. Good news is that you don't need to read it all.
We will only need to dig into the GPIO configuration and usage part.

## Digging the RA4M1 user manual for GPIO configuration

Jump to the Section `19. I/O Ports` of the manual. Here, everything that is needed for blinking the LED will be described. It's always easiest
to check for examples or usage notes first. Cited below is the procedure of specifying the pin function, which in our case means configuring the pin as output.

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