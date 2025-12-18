---
weight: 2
title: "Initializing awesome CMake projects with cmake-init"
date: 2025-09-13T15:58:26+08:00
draft: true
pubDate: 'Sep 13 2025'
author: "embeddedk8"
authorLink: "https://embeddedk8.com"
description: ""
images: []
resources:


tags: ["CMake", "C"]
categories: ["CMake"]

lightgallery: true

toc:
  auto: false
math:
  enable: true
---

In the past, when I was starting new C or C++ projects, I was either googling for "C project template" (pretty lame?) or
I was creating a fesh project template by hand, by adding directory structure, initial source files, and writing easy CMake.
Then, the project structure was simply developed as the project grew, when I started adding tests and CI/CD.

How could I live without knowing CMAKE-INIT? 


For installation, I had to create venv and install cmake-init inside venv. My project didn't need python venv, but for cmake-init 
you only need to run it once, so it's not a big cost. 

ADD A CODE HERE

After cmake-init is installed, it's really easy to setup project. It will just asks you a couple of questions:

Then it gives you ready project, with:
- advanced cmake structure, 
- Ci/CD on github actions that run: linter, coverage, sanitizers, tests on run on windows, linux and macos simulators,
- test template,
- release and debug builds,
- package managers

