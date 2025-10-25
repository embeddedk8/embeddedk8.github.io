---
weight: 2
title: "Arduino IDE upload process explained"
date: 2025-10-01T15:58:26+08:00
lastmod: 2025-10-01T15:58:26+08:00
draft: true
author: "embeddedk8"
authorLink: "https://embeddedk8.github.io"
description: "Explaining the upload process in Arduino IDE"
images: []
resources:
- name: "featured-image"
  src: "featured-image.png"

tags: ["Arduino"]
categories: ["Arduino"]

lightgallery: true

toc:
    auto: false
math:
    enable: true
---


Pressing the **Sketch Upload** will always trigger compilation first, to make sure that the latest version of the program will be flashed to the board.

{{< admonition note >}}
In previous post I described the Arduino IDE compilation process.
If you haven't seen it, it's recommended to start there!
{{</ admonition >}}



## Further Reading

1. https://www.electronicwings.com/arduino/basics-to-developing-bootloader-for-arduino
This is very nice article but please note it's for AVR CPU, and Presented on Arduino IDE 1.0.5. 
It's great explanation though.
2. https://www.baldengineer.com/arduino-bootloader.html
3. 