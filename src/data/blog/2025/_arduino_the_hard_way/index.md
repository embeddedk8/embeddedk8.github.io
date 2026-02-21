---
title: "Arduino the Hard Way: real embedded programming with Arduino UNO R4"
slug: 'arduino-the-hard-way'
pubDatetime: 2025-09-10T15:58:26+08:00
modDatetime: 2026-02-21T15:58:26+08:00
draft: false
author: "embeddedk8"
authorLink: "https://www.embeddedk8.com"
description: "Learn embedded systems the right way using Arduino UNO R4. This series goes beyond the Arduino API to explore real embedded development: toolchains, registers, RTOS, and more."
tags: ["Arduino"]
---

Arduino is one of the most popular ways to start learning embedded systems. At the same time, you can find plenty of debates online
about whether Arduino is a good choice for that (like [Is there anything wrong with Arduino?](https://www.reddit.com/r/embedded/comments/1bz55bj/is_there_anything_wrong_with_arduino/),
[Why engineers hate Arduino?](https://www.reddit.com/r/embedded/comments/evb5nu/why_engineers_hate_arduino/),
[Don't use Arduino for professional work](https://embedded.fm/blog/2017/8/12/dont-use-arduino-for-professional-work)).

While the list of arguments from Arduino "opponents" is quite long -- and some of their points are completely reasonable
-- you can learn just as much with Arduino as with any other embedded platform,
as long as you avoid blindly relying on the Arduino API and instead stay curious to explore what’s happening under the hood.
That's why I am creating the **Arduino the Hard Way** series. In this context, "The Hard Way" just means 
that we will go beyond the beginner-friendly Arduino layer and move forward doing things like real embedded engineers :) .

## Who is this for?

This series is for developers and hobbyists who are comfortable writing Arduino sketches and want to go deeper into real embedded systems.
If you've been using the Arduino API to get things working but feel like you're missing what's actually happening underneath --
how the code gets compiled, how it lands on the chip, how the hardware really works -- this series is for you.

It will be perfect if you have an Arduino UNO R4 WiFi or Minima, as the series is built around their shared microcontroller -- the Renesas RA4M1 (ARM Cortex-M4).
Many things will be totally different if you have an AVR-based board like the UNO R3, so if you have that, you can still follow along, but many CPU-related details won't match.

## My setup
- Arduino UNO R4 WiFi board
- Arduino IDE  2.3.6
- Ubuntu 24.04

If you're using a different IDE version or operating system -- some details may just look a little different on your setup.

## Arduino the Hard Way series

The posts in this series published so far:

1. [What happens when Arduino builds a sketch](https://www.embeddedk8.com/posts/2025/arduino-ide-build-process/)
2. [How to build Arduino sketches with Arduino CLI](https://www.embeddedk8.com/posts/2025/arduino-cli-compilation/)
3. [Adding CI/CD to Arduino projects: Github Actions and Wokwi simulation](https://www.embeddedk8.com/posts/2025/arduino-github-actions-with-wokwi/)
4. [Running Zephyr RTOS on Arduino UNO R4 WiFi ](https://www.embeddedk8.com/posts/2026/running-zephyr-on-arduino-uno-r4/)

More posts coming soon!

Sign up for the newsletter to get notified about new posts: [Disassembled Newsletter](https://disassembled.substack.com/subscribe).