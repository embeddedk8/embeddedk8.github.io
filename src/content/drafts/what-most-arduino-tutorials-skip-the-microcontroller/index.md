---
weight: 2
title: "What most Arduino tutorials skip: The microcontroller"
date: 2025-12-20T15:58:26+08:00
draft: true
pubDate: 'Dec 20 2025'
author: "embeddedk8"
authorLink: "https://embeddedk8.com"
description: "Arduino tutorials often focus on libraries, not the MCU. This post explains what the microcontroller is and why understanding it matters."
images: []
resources:

tags: ["Arduino", "microcontrollers"]

lightgallery: true

toc:
  auto: false
math:
  enable: true
---

> *This post is part of the From Arduino to Real Embedded Systems series, where I help understanding the Arduino internals and make you ready for real embedded projects*

Usually, or in so called "real embedded", you must udnerstand some basics of the microcontroller that is the center part of the embedded device that you program.
Arduino created a shortcut for it — and make it possible to write even advanced programs without even knowing what MCU you're handling.

While this shortcut is totally fine for a quick start, it's **not ok** to stop there if you image yourself in any role related to embedded systems.

In this post I will take a quick walk around the board Arduino Uno R4 WiFi and introduce you to the microcontroller of this board.

# Arduino Uno R4 WiFi Datasheet

The datasheet of the board itself is the first part to look at. 
I have found it located on official Arduino documentation center. The board page: [UNO R4 WiFi](https://docs.arduino.cc/hardware/uno-r4-wifi).
The datasheet and the User Manual: [Arduino Uno R4 WiFi Datasheet](https://docs.arduino.cc/resources/datasheets/ABX00087-datasheet.pdf).

The datasheet lists a lot of important board features and components but I want to focus now on the main microcontroller.

## Why bother on knowing the MCU

Like I already said, you can take out Arduino out of the box and actually program complicated things with almost no electronics/embedded 
devices knowledge. It's possible because Arduino makes it so simple for you. It gives you 