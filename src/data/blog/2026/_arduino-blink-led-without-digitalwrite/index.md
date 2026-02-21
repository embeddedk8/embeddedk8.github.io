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

Blinking an LED on Arduino is extremely easy if you use Arduino libraries. In this post, we`ll take the first step beyond the beginner-friendly approach. ;)

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
2. Set the pin to HIGH or LOW state.

This code will work on any Arduino board, because the Arduino libraries handle the hardware differences, which is pretty convenient.

However, the drawback is that at the same time the abstractions are hiding all interesting stuff that is going on under the hood.
You can successfully blink an LED and still not understand how the hardware actually works.
Additionally, we cannot assess if the implementation of Arduino libraries is efficient or not, and there are often claims about
the Arduino libraries have unnecessary overhead, or even implementation issues ([see: Reddit](https://www.reddit.com/r/embedded/comments/mbn7nm/where_are_the_bad_arduino_libraries/)).

To take a step further into real embedded programming, we will do the same task without using Arduino libraries.
Instead, we will read the Arduino Uno R4 and RA4M1 datasheets and configure the GPIO pin manually.

Our goal is to blink the LED without using `pinMode` and `digitalWrite` functions. 

For simplicity of this example, we will still use the Arduino sketch, the default Arduino setup, which is executed even before our `setup()` is called,
and `delay()` function, which is not the main focus of this post. So this is not a bare-metal yet, but we will be approaching it :)

## Which LED is it? First look into datasheet

Let's stick to our `LED_BUILTIN` LED, but without using the `LED_BUILTIN` macro. Let's do it like real engineers and check the pinout in [Arduino UNO R4 WiFi datasheet](https://docs.arduino.cc/resources/datasheets/ABX00087-datasheet.pdf).

![Arduino Uno R4 WiFi Pinout](@/assets/images/arduino-blink-led/pinout.png "Arduino Uno R4 WiFi Pinout, source: Arduino UNO R4 WiFi datasheet")
*Source: https://docs.arduino.cc/resources/datasheets/ABX00087-datasheet.pdf*

From the pinout diagram we see that `LED_BUILTIN` is connected to P102 pin of microcontroller. P102 means: PORT 1, PIN 02. This will be our output pin for blinking the LED.

## What microcontroller is it?

Ok, so we know which microcontroller pin, but we don't know yet which microcontroller is it :). Let's go back to Arduino UNO R4 WiFi datasheet.
On the first page we can find the exact microcontroller model: `R7FA4M1AB3CFM#AA0` from the Renesas RA4M1 series.
To proceed further, we need to consult the official hardware manual: [Renesas RA4M1 Group User’s Manual: Hardware](https://cdn.sparkfun.com/assets/b/1/d/3/6/RA4M1_Datasheet.pdf).

When you open this manual, you are leaving the friendly Arduino ecosystem, and entering the world of real embedded systems.
You will see more than 1400 pages of documentation. Good news is that you don't need to read it all.
For this tutorial, we will only need to dig into the GPIO configuration and usage part.

## Digging into the RA4M1 user manual for GPIO configuration

Jump to Section `19. I/O Ports` in the RA4M1 hardware manual. This section describes everything needed to control a GPIO pin and blink the LED.
It's always easiest to check for examples or usage notes first. Below is the procedure of specifying the pin function, which in our case means configuring the pin as output.
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
source: https://edm.eeworld.com.cn/ra4m1-Users_Manual_Hardware.pdf

Let’s break down what actually matters for our use case.

```
1. Clear the B0WI bit in the PWPR register. 
This enables writing to the PFSWE bit in the PWPR register.
```

The **PWPR** register is a Port Write Protection Register, which protects the pin configuration registers from accidental writes. 
By default, the B0WI bit is set to 1, which means that writes are locked. To allow changes to the pin configuration, we need to clear the B0WI bit.

You can consult again the manual to understand the PWPR and B0WI bit.

![RA4M1 -- GPIO PWPR register meaning](@/assets/images/arduino-blink-led/pwpr.png "RA4M1 -- GPIO PWPR register meaning, source: https://edm.eeworld.com.cn/ra4m1-Users_Manual_Hardware.pdf")

You can also see the address of the PWPR register and the bit number of B0WI bit in the manual.
```
Address(es): PMISC.PWPR 40040D03h
B0WI bit: 7
```

But for now, we can still reuse some Arduino definitions to make it easier. 
To access mentioned B0WI bit, we need to write to: `R_PMISC->PWPR_b.B0WI`. 
All these macros are defined by the Renesas RA4M1 support package, which is included in Arduino IDE for our board.
When you type it in IDE, you can click on the macro to jump to the header that defines these definitions. On my disk it's at:
`.arduino15/packages/arduino/hardware/renesas_uno/1.5.1/variants/UNOWIFIR4/includes/ra/fsp/src/bsp/cmsis/Device/RENESAS/Include/R7FA4M1AB.h`.

```
2. Set 1 to the PFSWE bit in the PWPR register. This enables writing to the PmnPFS register.
```



// Check datasheet
// https://docs.arduino.cc/resources/datasheets/ABX00087-datasheet.pdf
// https://edm.eeworld.com.cn/ra4m1-Users_Manual_Hardware.pdf
// Our led is LED_BUILTIN P102
// https://docs.arduino.cc/resources/datasheets/ra4m1-datasheet.pdf
//https://docs.arduino.cc/resources/datasheets/ra4m1-datasheet.pdf


https://kleinembedded.com/stm32-without-cubeide-part-1-the-bare-necessities/
https://github.com/MarcJacob/MyBareMetalLEDBlinker