---
title: "Why Zephyr RTOS is the best thing to happen to the Arduino UNO R4"
description: "Turn your ARM-based Arduino board into a high-performance, secure and professional hardware by running Zephyr RTOS on it."
pubDatetime: 2026-01-26T15:58:26+08:00
tags: ["Arduino", "Zephyr"]
draft: true
slug: 'running-zephyr-on-arduino-uno-r4'
---

Arduino UNO R4 is a pretty, toy-alike looking board that will greet you with a hearts when you turn it on. But don't let it fool you. 
Underneath it's advanced beast. It's only hidden under the surface of Arduino ecosystem.

In this post I want to show you what you're losing if you're using this board with Arduino IDE and how to enable true power from it.

![arduino-uno-r4](
@/assets/images/arduino-zephyr/board.png
"Arduino UNO R4 WiFi")

## ARM-based Arduino boards

At first, let's make sure that it's clear that [Arduino boards](https://www.arduino.cc/en/hardware/) can be, with some simplification, divided into
two groups: AVR-based Arduinos and ARM-based Arduinos. **If you are looking to buy Arduino board, please buy ARM board!!!**

While you can play along with AVR-based boards, there are quite outdated in today's world. ARM-based boards
are more powerful and let you learn and build the things that are existing in industry standard, not only in hobbyists rooms.

> AVR-based Arduino boards would not meet the minimal requirements for Zephyr, but it's because it's AVR and not because it's Arduino.
> ARM MCU are more advanced that's why Zephyr can work on ARM-based Arduino boards.


## What is Zephyr

In case you don't know it yet — [Zephyr](https://www.zephyrproject.org/) is open-source, professional [Real Time Operating System](https://en.wikipedia.org/wiki/Real-time_operating_system).
Zephyr popularity grows and seems to be second most popular RTOS
after FreeRTOS. It's used in products existing on the market so it definitely is a thing worth noticing if you learn or develop embedded systems.

I mentioned that you can run Zephyr on an ARM-based Arduino board because AVR microcontrollers are simply too limited to run such an advanced system as Zephyr.
If you have AVR board, you should be able to run [FreeRTOS](https://docs.arduino.cc/libraries/freertos/) there.
Or you can consider buying ARM board, which is good idea because ARM is most popular architecture now. (Sorry, I drifted from teh topic, but I wanted to say that ARM
is the thing now).

I won't talk here about what [Real Time Operating System](https://en.wikipedia.org/wiki/Real-time_operating_system) is - the important point here
is that after flashing the board with Zephyr it's really de-Arduinoed. You will write the code just as you would do it for
"real embedded development board" (although I just tried to tell that EVERY embedded board is real, but you know what I mean).

You will no longer be propmpted to write the code inside sketches, `loop()` or `setup()`. All becomes like other Zephyr-capable embedded board.



## Setting up Zephyr on your PC

The first step to proceed is just to install Zephyr on your PC. I will not describe it herel it changes from time to time,
and the latest ibstruction is available at [Developing with Zephyr » Getting Started Guide](https://docs.zephyrproject.org/latest/develop/getting_started/index.html).
Usually setting up Zephyr gives no issues, and all you need to do is to follow the instruction.

It takes so time. After running instructions you will have time to go make yourself coffe or exercise a bit :).

## Prepare your favorite IDE

You don't need Arduino IDE now. Choose the IDE you like the most. For not commercial, open source and educational project,
I like using [CLion](https://www.jetbrains.com/clion/buy/?section=personal&billing=monthly) (it offers free Non-Commercial licence).

If you prefer something else, it's up to you.

## Check the Arduino boards supported by Zephyr

The full lists of Zephyr supported Arduino boards is here:

https://docs.zephyrproject.org/latest/boards/index.html#vendor=arduino

Click on your board to read the ID of the board. In my case it's arduino_uno_r4.

## Build the Zephyr sample

If you exited the virtual environment, you need to go back

```
source ~/zephyrproject/.venv/bin/activate
cd ~/zephyrproject/zephyr
west build -p always -b arduino_uno_r4@wifi samples/basic/blinky
```

If you have different board, replace ID in the last command.

If you see something like this, it means the build was successfull:
```
-- Zephyr version: 4.3.99 (/home/kate/zephyrproject/zephyr), build: v4.3.0-3027-g545c2870e935
[142/142] Linking C executable zephyr/zephyr.elf
Memory region         Used Size  Region Size  %age Used
FLASH:       22536 B       240 KB      9.17%
RAM:        4712 B        32 KB     14.38%
OFS_OSIS_MEMORY:          28 B         28 B    100.00%
IDT_LIST:          0 GB        32 KB      0.00%
Generating files from /home/kate/zephyrproject/zephyr/build/zephyr/zephyr.elf for board: arduino_uno_r4
```

## Flash your board

```
(.venv) kate@kate-Legion-Y540-15IRH-PG0:~/zephyrproject/zephyr$ west flash
-- west flash: rebuilding
ninja: no work to do.
-- west flash: using runner pyocd
-- runners.pyocd: Flashing file: /home/kate/zephyrproject/zephyr/build/zephyr/zephyr.hex
Waiting for a debug probe to be connected...
```

after some time I got the error
```
(.venv) kate@kate-Legion-Y540-15IRH-PG0:~/zephyrproject/zephyr$ west flash
-- west flash: rebuilding
ninja: no work to do.
-- west flash: using runner pyocd
-- runners.pyocd: Flashing file: /home/kate/zephyrproject/zephyr/build/zephyr/zephyr.hex
0000568 C Target type r7fa4m1ab not recognized. Use 'pyocd list --targets' to see currently available target types. See <https://pyocd.io/docs/target_support.html> for how to install additional target support. [__main__]
FATAL ERROR: command exited with status 1: pyocd flash -e sector -a 0x4000 -t r7fa4m1ab /home/kate/zephyrproject/zephyr/build/zephyr/zephyr.hex
```

which made it clear,
```
(.venv) kate@kate-Legion-Y540-15IRH-PG0:~/zephyrproject/zephyr$ pyocd pack install r7fa4m1ab
0000491 I No pack index present, downloading now... [pack_cmd]
Downloading packs (press Control-C to cancel):
Renesas.RA_DFP.6.3.0
Downloading descriptors (001/001)
(.venv) kate@kate-Legion-Y540-15IRH-PG0:~/zephyrproject/zephyr$ west flash
-- west flash: rebuilding
ninja: no work to do.
-- west flash: using runner pyocd
-- runners.pyocd: Flashing file: /home/kate/zephyrproject/zephyr/build/zephyr/zephyr.hex
0001659 I Loading /home/kate/zephyrproject/zephyr/build/zephyr/zephyr.hex at 0x00004000 [load_cmd]
[==================================================] 100%
0016585 I Erased 24604 bytes (19 sectors), programmed 24604 bytes (19 pages), skipped 0 bytes (0 pages) at 1.61 kB/s [loader]
```

It worked and the LED is blinking.

## Play with the sample

Now, open the sample and play with the code. (You may want to make a copy first).
For example, make the LED blink faster by modifying the value
```
/* 1000 msec = 1 sec */
#define SLEEP_TIME_MS   1000
```

## More complicated sample

Not all samples are compatible with all boards. If sample is not compatible with your board, it won't compile.

samples/basic/blinky
samples/basic/blinky_pwm
samples/basic/fade_led

## Next steps

The next step would be to read the serial prints of the board, but I have lost my cable right now so I need to buy another one.
In general serial prints are not going via main USB for Zephyr, so we need the USB-TX/RX cable with male pins.
It should work when TX and RX are connected to D0(TX) and D1(RX) pins on Arduino Uno R4 Wifi, will test it once I get them.


