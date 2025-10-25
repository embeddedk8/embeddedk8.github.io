---
weight: 2
title: "Arduino Internals: Creating CI/CD pipeline for Arduino project"
date: 2025-10-01T15:58:26+08:00
lastmod: 2025-10-01T15:58:26+08:00
draft: true
author: "embeddedk8"
authorLink: "https://embeddedk8.com"
description: "Set up a CI/CD pipeline for Arduino projects. Automate builds, testing, and deployment using Arduino CLI and GitHub Actions"
images: []
resources:
- name: "featured-image"
  src: "featured-image.png"

tags: ["Arduino Internals"]
categories: ["Arduino Internals"]

lightgallery: true

toc:
    auto: false
math:
    enable: true
---



One of the biggest issues and challenges for embedded world is automating the process of
building and testing. Requiring each feature or release be tested on hardware is slowing down the 
development and release process. That's why each step that can be automated in embedded development
process is of price of gold.

In this post, I will create 


After downloading the default sketch from Arduino IoT Cloud, I added it to my sketch book, but it requires installing additional libraries.
I had to install ArduinoIoTCLoud from Manage Libraries.


We will create a very simple CI/CD for Arduino project with Github Actions.





## Sources:
1. https://blog.arduino.cc/2021/04/09/test-your-arduino-projects-with-github-actions