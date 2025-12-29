---
weight: 2
title: "How to Blink an LED on Arduino without `digitalWrite()`"
slug: 'arduino-blink-led-without-digitalwrite'
date: 2025-12-22T15:58:26+08:00
pubDate: 'Dec 22 2025'
draft: false
author: "embeddedk8"
authorLink: "https://embeddedk8.com"
description: "Learn how to blink an LED on Arduino without digitalWrite. Control GPIO directly using registers and datasheet knowledge."
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

# Arduino way to Blink an LED

To actually blink an LED on Arduino board (I have Arduino Uno R4 WiFi) all you need to do is to load the Blink example (Examples->Basics->Blink)
and upload the code to the board. Voila! LED is blinking. Arduino makes it so simply you don't even need to know anything or learn anything.

All the example code is shown below:

```
// the setup function runs once when you press reset or power the board
void setup() {
  // initialize digital pin LED_BUILTIN as an output.
  pinMode(LED_BUILTIN, OUTPUT);
}

// the loop function runs over and over again forever
void loop() {
  digitalWrite(LED_BUILTIN, HIGH);  // turn the LED on (HIGH is the voltage level)
  delay(1000);                      // wait for a second
  digitalWrite(LED_BUILTIN, LOW);   // turn the LED off by making the voltage LOW
  delay(1000);                      // wait for a second
}
```

What this example code is doing?
1. First, in setup(), it's setting the pin of ID LED_BUILDIN as an output.
2. In loop(), it's:
   3. writing to LED_BUILDIN the high state ('1') - turn on LED,
   4. delay 1s,
   5. write to LED_BUILDIN the low state ('0') - turn off LED.

## Arduino is hiding real operations from you

Let's try forget we have the Arduino API pinMode, digitalWrite and LED_BUILTIN definition and let's try to rewrite it the baremetal style.

Please note even without these functions, Arduino is still preparing setup for us, in methods called even before our setup is called.
So it's not yet real baremetal - only the blink part is.

## GPIO Basics

To understand the undercovers of Blink LED example, let's refresh the GPIO handling in embedded.

## Search for LED L in datasheet diagram

First, we need to know what PIN is responsible for our LED (LED_BUILTIN).
We don't want to use LED_BUILTIN macro.

Open the pinout page and try to locate the LED. It's also marked as LED_BUILTIN so things are clear. It gets signal from P102 pin.

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



// Check datasheet
// https://docs.arduino.cc/resources/datasheets/ABX00087-datasheet.pdf
// https://edm.eeworld.com.cn/ra4m1-Users_Manual_Hardware.pdf
// Our led is LED_BUILTIN P102
// https://docs.arduino.cc/resources/datasheets/ra4m1-datasheet.pdf
//https://docs.arduino.cc/resources/datasheets/ra4m1-datasheet.pdf


https://kleinembedded.com/stm32-without-cubeide-part-1-the-bare-necessities/
https://github.com/MarcJacob/MyBareMetalLEDBlinker