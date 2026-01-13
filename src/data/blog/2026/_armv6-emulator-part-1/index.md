---
weight: 2
title: "Writing ARM Cortex-M0 emulator — part 1"
pubDatetime: 2025-12-18T15:58:26+08:00
pubDate: 'Dec 18 2025'
author: "embeddedk8"
authorLink: "https://embeddedk8.com"
description: "How the Arduino builds the sketch — preprocessing, compiling, and linking explained simply"
images: []
resources:
tags: ["ARM", "Emulator"]
draft: true
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

"Cortex-M0 The smallest ARMÒ processordonly approximately 12000a logic gates at minimum
configuration. It is very low power and energy efficient."
The Definitive Guide to ARM Cortex M0

Smallest instruction set.

In general, the ARM Cortex-M0 and Cortex-M0þ processors are both very suitable for
ultra-low power applications, and because the instruction set and programmer’s model are
relatively simple, and the architecture is very C-friendly, they are also very suitable for
beginners.

The Cortex-M0 and Cortex-M0þ Processors:
•
•
•
•
•
Are 32-bit Reduced Instruction Set Computing (RISC) processor, based on an architec-
ture specification called ARMv6-M Architecture. The bus interface and internal data
paths are 32-bit width.
Have 16 32-bit registers in the register bank (r0 to r15). However, some of these regis-
ters have special purposes (e.g., R15 is the Program Counter, R14 is a register called
Link Register, and R13 is the Stack Pointer).
The instruction set is a subset of the Thumb Instruction Set Architecture. Most of the
instructions are 16 bit to provide very high code density.
Support up to 4 GB of address space. The address space is architecturally divided into a
number of regions.
Based on Von Neumann bus architecture (although arguably the Cortex-M0þ processor
have a hybrid bus architecture because of an optional separate bus interface for fast
peripheral register accesses, see section 4.3.2 Single Cycle I/O Interface in Chapter 4).Introduction 13
•
•
•
•
•
•
•
Designed for low-power applications, including architectural support for sleep modes
and have various low power features at the design/implementation level.
Includes an interrupt controller called NVIC. The NVIC provides very flexible and
powerful interrupt management.
The system bus interface is pipelined, based on a bus protocol called Advanced High-
performance Bus (AHBÔ ) Lite. The bus interface supports transfers of 8-bit, 16-bit, and
32-bit data, and also allows wait states to be inserted. The Cortex-M0þ processor also
have an optional bus interface (Single Cycle I/O interface, see section 4.3.2) for high-
speed peripheral registers, which is separated from the main system bus.
Support various features for the OS (Operating System) implementation such as a
system tick timer, shadowed stack pointer, and dedicated exceptions for OS operations.
Includes various debug features to enable software developers to create applications
efficiently.
Designed to be very easy to use. Almost everything can be programmed in C and in
most cases no need for special C language extension for data types or interrupt handling
support.
Provide good performance in most general data processing and I/O control applications.
The Cortex-M0 and Cortex-M0þ processors do not include any memory and have only
got one built-in timer which is primarily for OS operations. Therefore a chip designer
needs to add additional components in the chip design themselves.




ItemDescriptions
ROM
Flash
memory
SRAM
PLLRead Only MemorydNonvolatile memory storage for program code.
A special type of ROM, which can be reprogrammed many times, typically for storing
program code.
Static Random Access Memorydfor data storage (volatile)
Phase Lock Loopda device to generate programmable clock frequency based on a
reference clock.
Real Time Clockda low power timer for counting seconds (typically runs on a low power
oscillator), and in some cases also for minutes, hours and calendar functions.
General Purpose Input/Outputda peripheral with parallel data interface to control
external devices and to read back external signals status.
Universal Asynchronous Receiver/Transmitterda peripheral to handle data transfers in a
simple serial data protocol.
Inter-Integrated Circuitda peripheral to handle data transfers in a serial data protocol.
Unlike UART, a clock signal is required and can provide higher data rate.
Serial Peripheral Interfacedanother serial communication interface for off-chip
peripherals.
Inter-IC Soundda serial data communication interface specifically for audio information.
Pulse Width Modulatorda peripheral to output waveform with programmable duty cycle.
Analog to Digital Converterda peripheral to convert analog signal-level information into
digital form.
Digital to Analog Converterda peripheral to convert data values into analog signal level.
A programmable timer device for ensuring the processor is running program. When
enabled, the program running needs to update the watchdog timer within a certain time
gap. If the program crashed, the watchdog timed out and this can be used to trigger a
reset or a critical interrupt event.
RTC
GPIO
UART
I2C
SPI
I2S
PWM
ADC
DAC
Watchdog
timer


4. 
5. https://floooh.github.io/2017/01/02/yakc-overview.html
6. http://emubook.emulation64.com/