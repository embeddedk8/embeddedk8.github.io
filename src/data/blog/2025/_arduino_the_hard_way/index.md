---
title: "Arduino the Hard Way: learning embedded programming beyond Arduino magic"
slug: 'arduino-the-hard-way'
pubDatetime: 2025-09-10T15:58:26+08:00
modDatetime: 2025-09-10T15:58:26+08:00
draft: false
author: "embeddedk8"
authorLink: "https://embeddedk8.com"
description: "Learn embedded systems the right way using Arduino UNO R4 WiFi. This series goes beyond the Arduino API to explore real embedded development: toolchains, registers, RTOS, and more."
tags: ["Arduino"]
---

Arduino is one of the most popular ways to start learning embedded systems. At the same time, you can find plenty of debates online
about whether Arduino is a good choice for that (like [Is there anything wrong with Arduino?](https://www.reddit.com/r/embedded/comments/1bz55bj/is_there_anything_wrong_with_arduino/),
[Why engineers hate Arduino?](https://www.reddit.com/r/embedded/comments/evb5nu/why_engineers_hate_arduino/),
[Don't use Arduino for professional work](https://embedded.fm/blog/2017/8/12/dont-use-arduino-for-professional-work)).

While the list of arguments from Arduino "opponents" is quite long -- and some of their points are completely reasonable
-- you can learn just as much with Arduino as with any other embedded platform,
as long as you avoid blindly relying on the Arduino API and stay curious to explore what’s happening under the hood.
That's why I am creating the Arduino the Hard Way series.

## Assumed knowledge

I assume you already know how to compile and flash an Arduino board with the Arduino IDE, but haven’t yet dived into the internals of the compilation and flashing process.

## My setup
- Arduino UNO R4 WiFi board
- Arduino IDE  2.3.6
- Ubuntu 24.04

If you're using a different IDE version or operating system -- don't worry, you can still follow along. Some details may just look a little different on your setup.

However, if you're using a different Arduino board, the differences may be more significant.
The Arduino UNO R4 WiFi is powered by the Renesas RA4M1 (ARM Cortex-M4), 
and many posts in this series go into hardware-specific details. 
Older boards like the UNO R3 use a completely different architecture (AVR ATmega328P), so the low-level details won't match at all. 
The concepts will still apply, but the specifics won't transfer directly.

## Arduino the Hard Way series

1. [What happens when Arduino builds a sketch](https://www.embeddedk8.com/posts/2025/arduino-ide-build-process/)
2. [How to build Arduino sketches with Arduino CLI](https://www.embeddedk8.com/posts/2025/arduino-cli-compilation/)
3. [Adding CI/CD to Arduino projects: Github Actions and Wokwi simulation](https://www.embeddedk8.com/posts/2025/arduino-github-actions-with-wokwi/)
4. [Running Zephyr RTOS on Arduino UNO R4 WiFi ](https://www.embeddedk8.com/posts/2026/running-zephyr-on-arduino-uno-r4/)