---
title: "Arduino the Hard Way: real embedded with Arduino UNO R4"
slug: 'arduino-the-hard-way'
pubDatetime: 2025-09-10T15:58:26+08:00
modDatetime: 2026-02-24T15:58:26+08:00
draft: false
author: "embeddedk8"
authorLink: "https://www.embeddedk8.com"
description: "Learn embedded systems the right way using Arduino UNO R4. This series goes beyond the Arduino API to discuss: ARM architecture, registers, RTOS and more."
tags: ["Arduino"]
---
Arduino is one of the most popular ways to start learning embedded systems.
But for a long time, there was a gap between playing with an Arduino and doing professional embedded engineering.
It changed with the upgrade from Arduino Uno R3 to Arduino Uno R4, when 8-bit ATMega was replaced with a powerful ARM Cortex-M4 microcontroller, 
and the potential of this board has grown massively.

## Arduino the Hard Way series

Having [Arduino Uno R4](https://store.arduino.cc/products/uno-r4-wifi) you can do (and learn!) real advanced embedded engineering,
as long as you avoid blindly relying on the Arduino API. If you stay curious and explore what's happening under the hood,
this board becomes a gateway to the same ARM architecture found in medical devices, automotive systems, and industrial robots.

That's why I am creating the **Arduino the Hard Way** series. 

In this context, "The Hard Way" just means
that we will go beyond the beginner-friendly Arduino layer and move forward doing things like real embedded engineers :) .

*At the same time, please be aware that Arduino is not suitable for **everything**. 
You can read some discussion to get more context on that, for example [Is there anything wrong with Arduino?](https://www.reddit.com/r/embedded/comments/1bz55bj/is_there_anything_wrong_with_arduino/),
[Why engineers hate Arduino?](https://www.reddit.com/r/embedded/comments/evb5nu/why_engineers_hate_arduino/), and most important, a very clear explanation
[why you shouldn't use Arduino for professional work](https://embedded.fm/blog/2017/8/12/dont-use-arduino-for-professional-work).*

## Who is this for?

This series is for developers and hobbyists who are comfortable writing Arduino sketches and want to go deeper into real embedded systems.
If you've been using the Arduino API to get things working but feel like you're missing what's actually happening underneath --
how the code gets compiled, how it lands on the chip, how the hardware really works -- this series is for you.

It will be perfect if you have an Arduino UNO R4 WiFi or Minima.

## My setup
- Arduino UNO R4 WiFi board
- Arduino IDE  2.3.6
- Ubuntu 24.04

If you're using a different IDE version or operating system -- some details may just look a little different on your setup.

## Published posts

The posts in this series published so far:

1. [Understanding the Arduino build process: from a sketch to a binary](https://www.embeddedk8.com/posts/2025/arduino-ide-build-process/)
2. [Arduino CLI guide: advanced compilation, automation, and makefiles](https://www.embeddedk8.com/posts/2025/arduino-cli-compilation/)
3. [Adding CI/CD to Arduino projects: Github Actions and Wokwi simulation](https://www.embeddedk8.com/posts/2025/arduino-github-actions-with-wokwi/)
4. [Running Zephyr RTOS on Arduino UNO R4 WiFi ](https://www.embeddedk8.com/posts/2026/running-zephyr-on-arduino-uno-r4/)

More posts coming soon!

Sign up for the newsletter to get notified about new posts: [Disassembled Newsletter](https://disassembled.substack.com/subscribe).