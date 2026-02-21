---
weight: 2
title: "What most Arduino tutorials skip: The microcontroller"
pubDatetime: 2026-12-20T15:58:26+08:00
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

snap install typst
typst --version

vscode

Po instalacji otwórz i zainstaluj rozszerzenie:
Ctrl+Shift+X → wyszukaj Tinymist Typst → Install.

kate@kate-Legion-Y540-15IRH-PG0:~/embeddedk8$ mkdir arduino-the-hard-way
kate@kate-Legion-Y540-15IRH-PG0:~/embeddedk8$ cd arduino-the-hard-way/
kate@kate-Legion-Y540-15IRH-PG0:~/embeddedk8/arduino-the-hard-way$ mkdir chapters images code
kate@kate-Legion-Y540-15IRH-PG0:~/embeddedk8/arduino-the-hard-way$ touch main.typ
kate@kate-Legion-Y540-15IRH-PG0:~/embeddedk8/arduino-the-hard-way$ code .
kate@kate-Legion-Y540-15IRH-PG0:~/embeddedk8/arduino-the-hard-way$ touch chapters/01-why-arduino-holds-you-back.typ
kate@kate-Legion-Y540-15IRH-PG0:~/embeddedk8/arduino-the-hard-way$ typst compile main.typ

