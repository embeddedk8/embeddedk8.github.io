---
weight: 2
title: "Writing ARM Cortex-M0 emulator — part 1"
date: 2025-12-18T15:58:26+08:00
pubDate: 'Dec 18 2025'
author: "embeddedk8"
authorLink: "https://embeddedk8.com"
description: "How the Arduino builds the sketch — preprocessing, compiling, and linking explained simply"
images: []
resources:
tags: ["ARM", "Emulator"]

lightgallery: true

toc:
  auto: false
math:
  enable: true
---

# Why I want to implement ARM Cortex-M0 emulator

Implementing the emulator is a great way to gain the deep knowledge of the system. I have already implemented 
the CHIP-8 emulator in the past (which is known as the simplest emulator to implement for beginners — if you want to start with any emulator, 
CHIP-8 is probably recommended for you. There is plenty of resources about CHIP-8 emulation in the Internet). 

So I already had some basics of emulation, knew more or less how general CPU is working, etc.

During my work, but also in general, I see that I mostly use ARM Cortex-M cores. I implement programs that
run on Cortex-M (mostly it's Cortex-M33 in my case), but **do I really know the Cortex-M architecture**? 

You really can implement huge programs for specific architecture without need of understanding their internals.
Or you may even miss notyfying that you don't understand it when you should.
At the same time, raw reading the Architecture Manuals is not fun.

That's why I decided to implement Cortex-M emulator. I am sure it will give me a deep dive into the internals of ARMs and Cortex-M.

# What issues and challenges to implement Cortex-M emulator

When I am just starting this project, I think the biggest challenge is the observability and testability of created emulator.
In CHIP-8 case, the whole system is emulated and you can find a ready-to-load ROMs with games — you run the game, you immediately know if it's working or not.
As Cortex-M emulation is emulating **only the CPU (or possibly with some peripherals)** there is no easy way to test if it's working well,
and in general there will be nothing impressive to look at. It will not display images, games, give sounds,...

So how do I want to know if it's working or not?

My assumed definition of done would be a display of the CPU and memory state, like a debugger view, with commands to execute just 1 instruction or whole program etc.




# What is an emulator - shortly

It's good to start with reminding the difference between emulator and simulator.

Emulator allows to run original binary, designed for other CPU, on other CPU.

Simulator will require having other binary, but the result will look similar.

# How to write a CPU emulator - preparations

First, I have read some general posts on how to build (any) emulator.
The first article describes writing a CHIP-8 emulator, which is the simplest emulator to be implemented,
but at the same time, CHIP-8 is not a CPU or a hardware at all. It's a virtual machine, so it will also
give you a graphics and a keyboard already. Anyways, there are many common things when implementing CPU emulator and CHIP-8 emulator.

Short note: CHIP-8 emulator provides graphics, keyboard, and plenty of ready ROM-s that are program binaries that you can load to
your emulator to test it. So it's not only the easiest to write but also easiest to **test**.

https://multigesture.net/articles/how-to-write-an-emulator-chip-8-interpreter/



##

It focuses on emulating whole computers/games etc.  But it also covers CPU emulation part. 

https://fms.komkon.org/EMUL8/HOWTO.html


##

https://gecko05.github.io/2022/10/22/first-emulator-part1.html



General way:
1. Learn about the system you want to emulate: descibe memory, registers, architecture, how much instructions, little endian or big endian.
2. Choose the language of your implementation that you're familiar with.
2. Implement the CPU state.
3. Implement draft loop CPU execution.

The systems memory map ??

0x000-0x1FF - Chip 8 interpreter (contains font set in emu)
0x050-0x0A0 - Used for the built in 4x5 pixel font set (0-F)
0x200-0xFFF - Program ROM and work RAM



References:
1. Wikipedia on Cortex-M family: https://en.wikipedia.org/wiki/ARM_Cortex-M
It gives overview on ARM Cortex-M processors. By looking on optional component table, and instructions variations table,
you can see that Cortex-M0 is the smallest processor -- so it should be the easiest to emulate. For simplicity, to maximize chances
of making this project until the finish, I am choosing Cortex-M0 processor.


4. Armv6 architecture reference
2. 


4. 
5. https://floooh.github.io/2017/01/02/yakc-overview.html
6. http://emubook.emulation64.com/