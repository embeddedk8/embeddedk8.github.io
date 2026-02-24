---
weight: 2
title: "Blinking an LED on Arduino Uno R4 using direct register access"
slug: 'arduino-blink-led-without-digitalwrite'
pubDatetime: 2026-02-22T15:58:26+08:00
modDatetime: 2026-02-22T15:58:26+08:00
draft: true
author: "embeddedk8"
authorLink: "https://embeddedk8.com"
description: "Skip Arduino libraries and blink an LED on Arduino Uno R4 using direct registers access. We'll read RA4M1 datasheet and configure and configure a GPIO pin manually."
images: []
resources:
- name: "featured-image"
  src: "featured-image.png"

tags: ["Arduino", "GPIO", "RA4M1"]
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

Let's open Blink example to see the easy way to blink an LED:

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

This code will work on any Arduino board, because the Arduino libraries handle the hardware differences internally.
We would say that this code is hardware-agnostic. `LED_BUILTIN` can mean a different pin for different boards, `digitalWrite` will do different things
depending on the CPU architecture. That's why this example can look the same for every Arduino board (AVR-based, ARM-based, etc.).

It's convenient. However, the drawback is that at the same time the abstractions are hiding all interesting stuff that is going on under the hood.
One issue with that is that this is not really teaching us anything about embedded development: what really needs to be done to control the microcontroller pin?
Additionally, we cannot assess if the implementation of Arduino libraries is efficient or not, or if it's free from 
any bugs or other issues ([see: Reddit](https://www.reddit.com/r/embedded/comments/mbn7nm/where_are_the_bad_arduino_libraries/)).

That's why we will blink an LED without using Arduino libraries (well, not totally without, as we will still use some Arduino stuff).
Instead, we will read the Arduino Uno R4 and RA4M1 datasheets and configure the GPIO pin manually.

Our goal is to blink the LED without using `pinMode` and `digitalWrite` functions. 

For simplicity of this example, we will still use:
- the Arduino sketch, with the default/hidden Arduino setup, which is executed even before our `setup()` is called,
- `delay()` function,
- some definitions of the pins and registers from the Renesas RA4M1 support package, which is included in Arduino IDE for our board.

So this is not a bare-metal yet, but we will be approaching it :)

## Which LED is it? First look into datasheet

First we need to know where the LED that we want to blink is connected. From Arduino datasheet, or Blinky example, we know that it's `LED_BUILTIN` LED. 
I want to use the same LED, but without using the `LED_BUILTIN` macro, to show you how to find the pin number and how to configure it manually.
For this purpose check the pinout in [Arduino UNO R4 WiFi datasheet](https://docs.arduino.cc/resources/datasheets/ABX00087-datasheet.pdf).

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

## Usage Notes for GPIO configuration on RA4M1

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

Let’s break down what actually matters for our use case. But first, let's talk quickly about the access to registers.

## How to access registers on RA4M1 or any other microcontroller

As the procedure above requires us to write to specific registers and bits, we need to know how to find them and how to write to them.

Do you remember that a register is just a specific memory address that is mapped to a hardware function? To control the hardware, we need to write to these addresses.

We have two options:

- **manual access:** check the memory address of the register in the datasheet. Define the macro for this register address in the code.
Then, use the macros as a pointers to write to this register. This is the most basic way to access registers, but it can be quite tedious and error-prone, especially for complex microcontrollers with many registers.

- **using the support package:** most microcontroller manufacturers provide support packages for their chips, which include header files with definitions for all registers and bits.
In our case (Arduino Uno R4 with RA4M1 microcontroller), the support package is installed together with Arduino IDE, so we can use the provided definitions to access registers and bits more easily.
Let's look for the Flexible Software Package (FSP) for RA4M1 in the hidden Arduino files. On my disk, it's located at:

```
~/.arduino15/packages/arduino/hardware/renesas_uno/1.5.1/variants/UNOWIFIR4/includes/ra/fsp/src/bsp/cmsis/Device/RENESAS/Include/R7FA4M1AB.h
```

I suggest use the support package now. In the header `R7FA4M1AB.h` you will find all the registers definitions for RA4M1, including the ones we need to configure the GPIO pin.
Open this file and browse it; we will need to find the definitions for the registers we need. Then, let's follow the procedure.

## GPIO configuration procedure for RA4M1

### [1] Clear the B0WI bit in the PWPR register.

The **PWPR** register is a Port Write Protection Register, which protects the pin configuration registers from accidental writes. 
By default, the B0WI bit is set to 1, which means that writes are locked. To allow changes to the pin configuration, we need to clear the B0WI bit.

You can consult again the manual to understand the PWPR and B0WI bit.

![RA4M1 -- GPIO PWPR register meaning](@/assets/images/arduino-blink-led/pwpr.png "RA4M1 -- GPIO PWPR register meaning, source: https://edm.eeworld.com.cn/ra4m1-Users_Manual_Hardware.pdf")

You can also see the address of the PWPR register and the bit number of B0WI bit in the manual, but as we don't define the registers manually now, it's just FYI.
```
Address(es): PMISC.PWPR 40040D03h
B0WI bit: 7
```

But for now, we can still reuse some Arduino definitions to make it easier. 
To access mentioned B0WI bit, we need to write to: `R_PMISC->PWPR_b.B0WI`. 
All these macros are defined by the Renesas RA4M1 support package, which is included in Arduino IDE for our board.
When you type it in IDE, you can click on the macro to jump to the header that defines these definitions. On my disk it's at:
`~/.arduino15/packages/arduino/hardware/renesas_uno/1.5.1/variants/UNOWIFIR4/includes/ra/fsp/src/bsp/cmsis/Device/RENESAS/Include/R7FA4M1AB.h`.


### [2] Set 1 to the PFSWE bit in the PWPR register. 

The PFSWE bit is another protection bit in PWPR register (look at PWPR screenshot again). After clearing B0WI, we can now write to PFSWE. 
We need to set PFSWE bit to 1 to enable writing to PmnPFS (Port mn Pin Function Select Register) register.

### [3] Clear the Port Mode Control bit in the PMR for the target pin to select the general I/O port

Each GPIO pin on the CPU can serve two roles: it can be a general-purpose I/O pin, or it can be used for a specific peripheral function (like UART, SPI, etc.).
PMR (Port Mode Register) configures this role. 

![RA4M1 --  (PmnPF PDR bit meaning](@/assets/images/arduino-blink-led/pdr.png "RA4M1 --  (PmnPF PDR meaning, source: https://edm.eeworld.com.cn/ra4m1-Users_Manual_Hardware.pdf")
![RA4M1 --  (PmnPF PMR bit meaning](@/assets/images/arduino-blink-led/pmr.png "RA4M1 --  (PmnPF PMR meaning, source: https://edm.eeworld.com.cn/ra4m1-Users_Manual_Hardware.pdf")

So for our LED pin -- general I/O purpose -- we need to clear the PMR bit.

### Specify the input/output function for the pin through the PSEL[4:0] bit settings in the PmnPFS register

PSEL decides which peripheral function is assigned to the pin. Since we want to use it as a general I/O pin, and PMR bit was
already cleared, we don't need to set PSEL.

### Set the PMR to 1 as required to switch to the selected input/output function for the pin

Again, this is not needed for our usecase. We want to use pin as general I/O, so PMR should be 0.
Instead, we need to set the pin as output, which is done by setting PDR (Port Direction Bit) bit in PmnPFS register.

### [4] Set the PDR bit in PmnPFS register to 1 to configure the pin as output
The pin is already configured as general I/O, but we need to specify the direction -- will it be input or output?
For blinking LED, it's output, so we need to set PDR bit to 1.

### [5] and [6] Clear the PFSWE bit and set B0WI bit to lock the configuration
After we finish configuring the pin, set the protection bits back to their default state to prevent accidental changes to the pin configuration later in the code. 
This means we need to clear PFSWE bit and set B0WI bit back to 1.

### Full code needed to configure the pin as I/O output

The full configuration goes as follows:

```cpp
void setup() {
    R_PMISC->PWPR_b.B0WI  = 0; // [1]
    R_PMISC->PWPR_b.PFSWE = 1; // [2]

    R_PFS->PORT[port].PIN[pin].PmnPFS_b.PMR = 0; // [3]
    R_PFS->PORT[port].PIN[pin].PmnPFS_b.PDR = 1; // [4]

    R_PMISC->PWPR_b.PFSWE = 0; // [5]
    R_PMISC->PWPR_b.B0WI  = 1; // [6]
}
```

## Set the pin to high or low state to blink a LED

Now, we only need to set the pin to HIGH or LOW state to blink the LED. This is done by writing to the PODR (Port Output Data Register) register.

```cpp
void loop() {
    R_PORT1->PODR_b.PODR2 = 1;  // ON
    delay(1000);   
    R_PORT1->PODR_b.PODR2 = 0;  // OFF
    delay(1000);                // wait for a second
}
```


// Check datasheet
// https://docs.arduino.cc/resources/datasheets/ABX00087-datasheet.pdf
// https://edm.eeworld.com.cn/ra4m1-Users_Manual_Hardware.pdf
// Our led is LED_BUILTIN P102
// https://docs.arduino.cc/resources/datasheets/ra4m1-datasheet.pdf
//https://docs.arduino.cc/resources/datasheets/ra4m1-datasheet.pdf


https://kleinembedded.com/stm32-without-cubeide-part-1-the-bare-necessities/
https://github.com/MarcJacob/MyBareMetalLEDBlinker