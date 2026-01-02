---
title: ""
description: ""
pubDate: 2026-01-01
tags: []
draft: true
---

Did I mention that Arduino boards are just as real embedded development boards as any other boards? You're not forced to use them with Arduino IDE and Arduino libraries.
If you have ARM-based Arduino board, you can even program it with Real Time Operating system, like Zephyr! 

> AVR-based Arduino boards would not meet the minimal requirements for Zephyr, but it's because it's AVR and not because it's Arduino.
> ARM MCU are more advanced that's why Zephyr can work on ARM-based Arduino boards.

I won't talk here about what [Real Time Operating System](https://en.wikipedia.org/wiki/Real-time_operating_system) is - the important point here
is that after flashing the board with Zephyr it's really de-Arduinoed. You will write the code just as you would do it for 
"real embedded development board" (although I just tried to tell that EVERY embedded board is real, but you know what I mean).

You will no longer be propmpted to write the code inside sketches, `loop()` or `setup()`. All becomes like other Zephyr-capable embedded board.

## What is Zephyr

In case you don't know it - Zephyr is open-source, professional real time operating system. Zephyr popularity grows and seems to be second most popular RTOS
after FreeRTOS. 

## Setting up Zephyr on your PC

The first step to proceed is just to install Zephyr on your PC. I will not describe it herel it changes from time to time, 
and the latest ibstruction is available at [Developing with Zephyr » Getting Started Guide](https://docs.zephyrproject.org/latest/develop/getting_started/index.html).
Usually setting up Zephyr gives no issues, and all you need to do is to follow the instruction.

It takes so time. After running instructions you will have time to go make yourself coffe or exercise a bit :).

## Prepare your favorite IDE

You don't need Arduino IDE now. Choose the IDE you like the most. For not commercial, open source and educational project,
I like using [CLion](https://www.jetbrains.com/clion/buy/?section=personal&billing=monthly) (it offers free Non-Commercial licence).

If you prefer something else, it's up to you.



