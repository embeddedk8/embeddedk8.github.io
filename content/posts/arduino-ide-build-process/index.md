---
weight: 2
title: "Arduino IDE build process explained (in details)"
date: 2025-09-13T15:58:26+08:00
lastmod: 2025-09-13T15:58:26+08:00
draft: true
author: "embeddedk8"
authorLink: "https://embeddedk8.github.io"
description: "Explaining the compilation process in Arduino IDE"
images: []
resources:
- name: "featured-image"
  src: "featured-image.png"

tags: ["content", "Arduino"]
categories: ["Arduino"]

lightgallery: true

toc:
  auto: false
math:
  enable: true
---

Many beginner embedded developers begin their journey with the Arduino development board. Which is great and extremely easy to use even with no prior knowledge!
You can just choose a sketch and with two clicks compile it and upload it to the board. But to truly benefit from experimenting on Arduino and later be able to move to more professional setups, it's necessary to understand what is an Arduino Sketch and what is really happening under the hood when you compile and upload your code.

{{< admonition note "Assumed Knowledge" true >}}
I assume you already know how to compile and flash an Arduino board with the Arduino IDE, but haven’t yet dived into the internals of the compilation and flashing process.
{{< /admonition >}}

{{< admonition note "Setup I used" true >}}
- Arduino UNO R4 WiFi board
- Arduino IDE  2.3.6
- Linux Mint

Described things may look different on your PC.
{{< /admonition >}}

## Compiling first Sketch
Let's choose the proper board, load example Sketch (Blink is OK), then click Verify/Compile. Observe the **Output** window.
If you still have default settings in Arduino IDE, you won't learn much from it yet.

[![Arduino IDE doesn't say much about compilation steps by default](/arduino-ide-default-output.png)](/arduino-ide-default-output.png)

## Enable verbose output 
If your **Output** looks like above, you need to mark `File->Preferences->Show verbose output` setting for both compiling and upload, and compile again.
<br>


[![Verbose compilation output in Arduino IDE](/arduino-ide-verbose-output.png)](/arduino-ide-verbose-output.png)

Now the output is more complete. 

## Board and package identification

The first piece of information the Arduino IDE shows is the board you’ve selected:
```bash
FQBN: arduino:renesas_uno:unor4wifi
Using board 'unor4wifi' from platform in folder: /home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.4.1
Using core 'arduino' from platform in folder: /home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.4.1
```

**FQBN** (Fully Qualified Board Name) is a unique identifier that tells the IDE exactly which board you’re compiling for.
- Vendor: arduino → official Arduino package
- Architecture: renesas_uno → Renesas-based boards family
- Board: unor4wifi → exact model: the Arduino Uno R4 WiFi.

These lines also show where the platform files are stored locally on your system. 
These folders contain board definitions and the Arduino core.

It’s worth taking a look inside those directories. Among other files, you’ll find `main.cpp`, which defines the actual `main()` function. 
This is where the `setup()` and `loop()` (which you have defined in your Sketch) are called behind the scenes. 
There’s a lot more happening in that code. Do you want to explore what other logic the Arduino framework quietly sets up for you?
Let’s take a quick peek at `main.cpp` and let's go back to our Build Output.

## Creating the temporary build directory
When you compile a sketch, the Arduino IDE doesn’t build it directly in your project folder. 
Instead, it creates a temporary build directory to store all intermediate files.

In the build log, you can spot its location. For example, this Sketch on my system got:
`/home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/sketch/`.

If you open corresponding folder on your system, you’ll see the build artifacts (object files, preprocessed sources, and other generated code). 
Now they’re already complete, as our build process has finished.
We’ll come back and examine these files in more detail later. 
For now, let’s return to the Build Output and continue following the process step by step.

## Preprocessing: Detecting libraries used
The first phase of the build is preprocessing. For readability, I’ve shortened the command shown in the log:
```
Detecting libraries used...
/home/kate/.arduino15/packages/arduino/tools/arm-none-eabi-gcc/7-2017q4/bin/arm-none-eabi-g++ (...) -E \
/home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/sketch/MyBlink.ino.cpp -o /dev/null
```
Here, the compiler is invoked with the **-E** flag, which runs only the preprocessor stage. 
This step is used to figure out which libraries your Sketch actually needs.
Arduino IDE compiles only the libraries you include. Otherwise, every build would be painfully slow.
In the case of the Blink Sketch, this stage isn’t very exciting: it doesn’t pull in any additional libraries that need compilation.
That’s why the Build Output doesn’t list any detected libraries.

{{< admonition tip >}}
Try opening other example sketches, such as those from **WiFiS3** or **EEPROM**, and compare the output under *Detecting libraries used...*

Can you figure out how the IDE decides which libraries to compile?

Hint: the *#include* directives and the preprocessor are key players here!
{{</ admonition >}}

## Preprocessing: Generating function prototypes
The next stage in the build process is function prototype generation.
```
Generating function prototypes...
/home/kate/.arduino15/packages/arduino/tools/arm-none-eabi-gcc/7-2017q4/bin/arm-none-eabi-g++ -c -w -Os -g3 -fno-use-cxa-atexit -fno-rtti -fno-exceptions -nostdlib -DF_CPU=48000000 -DNO_USB -DBACKTRACE_SUPPORT -DARDUINO_UNOR4_WIFI -std=gnu++17 -mcpu=cortex-m4 -mfloat-abi=hard -mfpu=fpv4-sp-d16 -fsigned-char -ffunction-sections -fdata-sections -fmessage-length=0 -fno-builtin -w -x c++ -E -CC -DARDUINO=10607 -DPROJECT_NAME="/home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/MyBlink.ino" -DARDUINO_UNOWIFIR4 -DARDUINO_ARCH_RENESAS_UNO -DARDUINO_ARCH_RENESAS -DARDUINO_FSP -D_XOPEN_SOURCE=700 -mthumb @/home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.4.1/variants/UNOWIFIR4/defines.txt -DCFG_TUSB_MCU=OPT_MCU_RAXXX -I/home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.4.1/cores/arduino/tinyusb -I/home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.4.1/cores/arduino/api/deprecated -I/home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.4.1/cores/arduino/api/deprecated-avr-comp -I/home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.4.1/cores/arduino -I/home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.4.1/variants/UNOWIFIR4 -iprefix/home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.4.1 @/home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.4.1/variants/UNOWIFIR4/includes.txt /home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/sketch/MyBlink.ino.cpp -o /tmp/1121713208/sketch_merged.cpp
/home/kate/.arduino15/packages/builtin/tools/ctags/5.8-arduino11/ctags -u --language-force=c++ -f - --c++-kinds=svpf --fields=KSTtzns --line-directives /tmp/1121713208/sketch_merged.cpp
```



We now learned about:




- The toolchain is located in 
`~/.arduino15/packages/arduino/tools/arm-none-eabi-gcc/7-2017q4/bin/`

- The compiled file: `~/.cache/arduino/sketches/47AF1217FD2DF7091F869FE16F095863/sketch/Blink.ino.cpp`
- Some of compilation flags used: `-w -Os -g3 -fno-use-cxa-atexit -fno-rtti -fno-exceptions -nostdlib -DF_CPU=48000000 -DNO_USB -DBACKTRACE_SUPPORT -DARDUINO_UNOR4_WIFI -std=gnu++17 -mcpu=cortex-m4 -mfloat-abi=hard -mfpu=fpv4-sp-d16 -fsigned-char -ffunction-sections -fdata-sections`
- Some of linked libraries: `-lstdc++ -lsupc++ -lm -lc -lgcc -lnosys`
- The final ELF is located in `~/.cache/arduino/sketches/49B32143694CE560A1D3954602488E33/Blink.ino.elf`

## Converting MyBlink.ino into MyBlink.ino.cpp file

Let's take a look on the original .ino file and .cpp file that we compiled. The first file, MyBlink.ino is the actual content of what I wrote into Arduino IDE.

```cpp {linenos=table,linenostart=26}
void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(6000);
    digitalWrite(LED_BUILTIN, LOW);
    delay(1000);
}
``` 



In the build folder of my sketch, I find MyBlink.ino.cpp. This is the post-processed .cpp file made from my sketch. (I removed comments for cleariness)
The loop() and init() functions bodies are untouched, but someone addedd <Arduino.h> and weird line macros.
The purpose of these macros is to match your .ino line number, when the compilation message (warning/error) comes from modified MyBlink.ino.cpp file. Without it, you would not be able to 
match the compilation message place to place in your code.

```cpp
#include <Arduino.h>
#line 1 "/home/kate/Arduino/MyBlink/MyBlink.ino"

#line 26 "/home/kate/Arduino/MyBlink/MyBlink.ino"
void setup();
#line 32 "/home/kate/Arduino/MyBlink/MyBlink.ino"
void loop();
#line 26 "/home/kate/Arduino/MyBlink/MyBlink.ino"
void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
    digitalWrite(LED_BUILTIN, HIGH); 
    delay(6000);
    digitalWrite(LED_BUILTIN, LOW);
    delay(1000);
}
```



Using previously compiled file: /home/kate/.cache/arduino/sketches/47AF1217FD2DF7091F869FE16F095863/core/tmp_gen_c_files/pin_data.c.o
Using previously compiled file: /home/kate/.cache/arduino/sketches/47AF1217FD2DF7091F869FE16F095863/core/tmp_gen_c_files/common_data.c.o
Using previously compiled file: /home/kate/.cache/arduino/sketches/47AF1217FD2DF7091F869FE16F095863/core/tmp_gen_c_files/main.c.o
Using previously compiled file: /home/kate/.cache/arduino/sketches/47AF1217FD2DF7091F869FE16F095863/core/variant.cpp.o

Some of std linked libraries are -lstdc++ -lsupc++ -lm -lc -lgcc -lnosys 

The output file is
Blink.ino.hex

We didn't define any main function - let's try to find it! 

## Disassembling output file

As we already learned the toolchain path from the verbose output file, we also know the location of other useful binaries - like objdump
and readelf! As the last step, let's disassemble the final binary of Blink application.


## More reading

https://docs.arduino.cc/arduino-cli/sketch-build-process/ 

