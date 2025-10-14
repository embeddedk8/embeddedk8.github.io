# How the Arduino IDE builds your code – step by step

As an embedded developer, you probably can't help wondering what actually happens when Arduino IDE builds the sketch.
What’s being compiled, where the files go, and how the toolchain turns the code into instructions able to run on the board?
<!--more-->

While building an Arduino sketch with the Arduino IDE seems as simple as clicking one button,
under the hood, the IDE performs several important steps: some are common to every embedded development environment, 
while others are unique to Arduino — and they might surprise you if you’re new to it.

In this post, we’ll take a closer look at **what actually happens when the Arduino IDE builds your sketch**.
Understanding this process can help you move toward more advanced embedded development.
# Understanding Arduino IDE build process

{{< admonition note "Assumed knowledge" true >}}
I assume you already know how to compile and flash an Arduino board with the Arduino IDE, but haven’t yet dived into the internals of the compilation and flashing process.
{{< /admonition >}}

{{< admonition note "My setup" true >}}
- Arduino UNO R4 WiFi board
- Arduino IDE  2.3.6
- Linux Mint

If you’re using a different board, IDE version, or operating system — don’t worry! You can still follow along. Some details may just look a little different on your setup.
{{< /admonition >}}

## What you will learn?
After reading this article, you will:
- understand the standard build flow in embedded software development,
- learn which additional steps the Arduino IDE performs on top of it.

## Let's start!

Let's build a sketch together and go step by step along the build process.

### Build an example sketch
Open your Arduino IDE and pick the right board from **Select Board** menu. 
In my case it's **Arduino UNO R4 WiFi**.

{{< admonition tip >}}
The **Arduino UNO R4 WiFi** is based on an **ARM** architecture. Be aware that some other Arduino boards (like the **UNO R3** or **Mega 2560**) use **AVR** architecture instead. 
This means the compilation process and generated machine code will differ between these boards.
{{< /admonition >}}

Load up the Blink example. Make a minimal change (like changing the delay value) and save the new sketch in your sketchbook.
Then, to trigger the build, click **Verify/Compile** and observe the **Output** window.

In my IDE, only a very short message has appeared in **Output** window. It looks that the sketch has been built successfully and
is ready to upload to the board. The message contains only two lines, because I didn't change 
the Arduino IDE’s default settings yet, so the **Output** is mostly hidden.

[![Arduino IDE doesn't say much about compilation steps by default](/arduino-ide-default-output.png "Arduino IDE - default build output")](/arduino-ide-default-output.png)

### Enable verbose output
To understand the build process better, it will be useful to enable the **verbose output** in IDE.
To do so, I need to mark `File-> Preferences-> Show verbose output` setting for both compiling and upload, and compile again.
Now the output will be complete.
Let’s break it down to atoms!
<br>


[![Verbose compilation output in Arduino IDE](/arduino-ide-verbose-output.png "Arduino IDE - verbose build output")](/arduino-ide-verbose-output.png)


## Board and package identification
The first lines in Output are identifying the board.

When building a sketch, the Arduino environment needs to know exactly which board you are using — and it knows it because
you have selected the right board from **Select Board** menu. Thanks to this, the compiled code will match
the board’s architecture, hardware, pin mapping etc.

This board identity is called **FQBN (Fully Qualified Board Name)** and presents as follows:
```bash
FQBN: arduino:renesas_uno:unor4wifi
Using board 'unor4wifi' from platform in folder: /home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.4.1
Using core 'arduino' from platform in folder: /home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.4.1
```

**FQBN** is unique for each board. It consists of three segments:
- Vendor: `arduino` (*it's official Arduino package*)
- Architecture: `renesas_uno` (*Renesas-based boards family*)
- Board: `unor4wifi` (*exact model: Arduino Uno R4 WiFi*).

If you choose wrong board, the code may compile but fail at runtime, or compilation may fail.

{{< admonition tip >}}
Error `Compilation error: Missing FQBN (Fully Qualified Board Name)` means you have not selected any board from menu.
{{</ admonition>}}

## Arduino specific directories
The compilation artifacts and packages used by the Arduino environment are stored in several hidden directories.

You can see their paths in the build log — let’s take a closer look.

### Arduino15 directory
**Arduino15** contains user preferences,
downloaded board packages (cores, toolchains, board definitions) and libraries that Arduino automatically installs. The 
[exact location depends on your operating system](https://support.arduino.cc/hc/en-us/articles/360018448279-Open-the-Arduino15-folder).

{{< admonition tip >}}
In some cases, you may want to move the **Arduino15 folder** —  for example, to free up space on your primary drive.

To do this:

1. Copy the **Arduino15** directory to your desired location.

2. Open the file `~/.arduinoIDE/arduino-cli.yaml` and update the `directories:data` path, for example:

```
board_manager:
    additional_urls: []
directories:
    data: /home/kate/new-location-arduino15
```

3. Restart the Arduino IDE. It will now use the new **Arduino15** location. Verify the build output to ensure everything is working correctly.

4. Once you’ve confirmed everything works correctly, you can safely delete the old folder.
{{< /admonition >}}


Take a look on [boards.txt](https://arduino.github.io/arduino-cli/1.3/platform-specification/#boardstxt) file for your platform, located somewhere in `Arduino15/packages` (take a look at the build output with teh board identity —
you will find the proper directory there).
This file lists all supported boards. Each board has its own section with key-value pairs that define how to compile, upload, and debug for that target.
Here’s the entry for the Arduino UNO R4 WiFi:

```
##############################################################

unor4wifi.name=Arduino UNO R4 WiFi
unor4wifi.build.core=arduino
unor4wifi.build.crossprefix=arm-none-eabi-
unor4wifi.build.compiler_path={runtime.tools.arm-none-eabi-gcc-7-2017q4.path}/bin/

unor4wifi.build.variant=UNOWIFIR4
unor4wifi.build.mcu=cortex-m4
unor4wifi.build.architecture=cortex-m4
unor4wifi.build.fpu=-mfpu=fpv4-sp-d16
unor4wifi.build.float-abi=-mfloat-abi=hard

unor4wifi.upload.tool=bossac
...
```
Thanks to those settings, once you select your board from the **Select Board** menu, 
the correct toolchain, compiler flags (such as MCU type and clock speed) and upload tool are selected automatically.

### Arduino core
Inside **Arduino15** directory there is a folder called **Arduino Core**. It contains the essential components of your Arduino program 
and is specific to the hardware platform you are using. You can find it in the cores subdirectory of your board package, for example:

```
.arduino15/packages/arduino/hardware/renesas_uno/1.4.1/cores/
```

The Arduino Core contains, among others:
- `main.cpp` file, defining the code that is executed even before your `setup()` is called, and calling your `loop()` in a loop,
- `Arduino.h` header — the main include for all sketches,
- implementations of interrupts, UART communication, timing functions like `delay` etc.

Open the `main.cpp` and browse the logic that Arduino is adding around the code you implemented in the sketch.

{{< admonition type=info >}}
The **Arduino Core** implements the Arduino API for a specific architecture or chip family. Each family, or board platform, has its own core, 
tailored to the hardware and peripherals.
{{< /admonition >}}


### Build directory
When you compile a sketch, the Arduino IDE doesn’t build it directly in your project folder.
Instead, it creates a build directory — a per-sketch cache — in a hidden folder to store all intermediate files. 

This approach lets the IDE generate builds for different boards or variants without cluttering your sketch folder. 
You can find the path to this build directory in the build log. For example, my sketch was built here:

``` 
/home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/sketch/`.
```
If you open this folder, you’ll see the build artifacts, including:
- object files (`.o`),
- preprocessed sources (`.cpp`),
- final binaries (`.bin`, `.hex`, `.elf`).


{{< admonition tip `Exporting Compiled Binary`>}}
If you want to have the compiled binaries in your sketch folder, click **Sketch → Export Compiled Binary** option from Arduino IDE menu. 
This will build your sketch and place a copy of the `.hex`, `.bin`, `.elf` and `.map` inside the sketch sources 
folder so it’s easy to find later.
{{</ admonition >}}

Now, let's take a look at next lines from Build Output.

## Preprocessing
The first phase of the C/C++ program build is preprocessing. In Arduino, preprocessing includes some specific steps.

### Detecting libraries used
Before any actual compilation happens, the Arduino IDE scans your code to figure out which additional libraries your sketch needs.
In the build log, you’ll see something like this (shortened for readability):
```
Detecting libraries used...
/home/kate/.arduino15/packages/arduino/tools/arm-none-eabi-gcc/7-2017q4/bin/arm-none-eabi-g++ (...) -E \
/home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/sketch/MyBlink.ino.cpp -o /dev/null
```
Here, the compiler is invoked with the `-E` flag, which tells it to stop after the preprocessing
stage and not produce any compiled output.
It will only expand all `#include` directives and check which libraries are required for your sketch. 
Based on this, the IDE knows which libraries should be compiled and which 
include directories need to be added to the build process.

For a simple sketch like Blink, this stage isn't very exciting: it doesn't pull in any additional libraries.
That's why the build output doesn't show anything under *Detecting libraries used...*.
Open other example sketches, such as those from **WiFiS3** or **EEPROM**, and you'll see how more complex projects trigger detection of multiple libraries.

**Why such preprocessing is needed?**

Arduino IDE compiles only the libraries that your sketch needs.
In other development environments, this step is usually the developer’s responsibility: you must explicitly tell the compiler which libraries or dependencies to include in the build.
Arduino automates this process, scanning your code and selecting what’s needed.


{{< admonition tip >}}
Notice the toolchain path: `.arduino15/packages/arduino/tools/arm-none-eabi-gcc/7-2017q4/bin/`.

Besides the compiler itself, toolchain contains other useful tools like `objdump`. We may use it later!
{{</ admonition >}}



### Automatic function prototypes generation
The next stage in the build process is automatic function prototype generation. In C or C++, each function must be
either defined or declared before it's called. In Arduino, you don't need to worry about that - you can write whatever functions
in any order, without adding their prototypes. How does it work? Arduino generates these prototypes for you!

Here’s what the build log shows:
```
Generating function prototypes...
arm-none-eabi-g++ (...) -E /home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/sketch/MyBlink.ino.cpp -o /tmp/1121713208/sketch_merged.cpp
ctags (...) /tmp/1121713208/sketch_merged.cpp
```
Again, the compiler is invoked with the `-E` flag, meaning only the preprocessor runs. 
Behind the scenes, the Arduino IDE performs these steps for you:
1. **Concatenate .ino files**

    All `.ino` files in the sketch folder are concatenated into a single file (`MyBlink.ino.cpp`).
2. **Preprocess it**

    The new `MyBlink.ino.cpp` is input for the preprocessor: `#include`s are expanded and macros replaces.
    The expanded file is stored as `/tmp/1121713208/sketch_merged.cpp`.

3. **Scan functions**

    Tool `ctags` is running over expanded `sketch_merged.cpp`, to extract function symbols.

4. **Generate prototypes**

    Based on the `ctags` result, the IDE inserts forward declarations (prototypes) for you. This way, you don't need to worry 
about undeclared functions, functions order, etc.

5. **Store prototypes into .ino.cpp**

    The resulting version is stored into `MyBlink.ino.cpp`. This is what the compiler will actually use later on.


Your simple sketch (`MyBlink.ino`):

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

gets transformed into (`MyBlink.ino.cpp`):
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

To summarize differences:
- `#include <Arduino.h>`

    in preprocessed file there is `<Arduino.h>` header added,
- `#line` macros

    These keep compiler error messages pointing to the right lines in your .ino file. 
Without them, errors would show up with the line numbers of the generated .cpp, which would be super confusing.

- function prototypes are added.

## Compilation

### Sketch compilation
Here’s where your code finally turns into machine instructions.
```
Compiling sketch...
arm-none-eabi-g++ (...) -c sketch/MyBlink.ino.cpp -o sketch/MyBlink.ino.cpp.o
```
Now we reached the sketch compilation.
Compiler is ivoked with `-c` flag, which means compile only (generate object code .o, don’t link).

**Input:** `MyBlink.ino.cpp` - the auto-generated sketch with prototypes, includes, and line directives.

**Output:** `MyBlink.ino.cpp.o` - machine-code object file, ready to be linked later.

I shortened the compilation command, so it's not in the snippet above, but in IDE we can observe a lots of compilation flags that were used.
Some highlights:
- `-Os` → optimize for size.
- `-g3` → include debug info at max level.
- `-fno-rtti`, `-fno-exceptions` → strip C++ runtime features to save space.
- `-nostdlib` → don’t link against standard system libraries.
- `-mcpu=cortex-m4 -mthumb -mfloat-abi=hard -mfpu=fpv4-sp-d16` → target an ARM Cortex-M4 with hardware floating point.
- `-I` and `@.../includes.txt` → add search paths for Arduino core and variant headers.
- Many `-D...` → defines for board, CPU frequency, Arduino version, etc.

{{< admonition >}}
Most advanced IDEs let you change compiler settings like optimization level, debug info, or extra flags right from a project menu.  
Arduino IDE is so simple that it doesn't offer this option: you don’t get a button or menu for that.

If you want to change some settings, you’ve got two ways:

- **Edit build recipes**: you can change files like `platform.txt` or `boards.local.txt` to change or add your own compilation flags.
- **Use Arduino CLI**: the command-line tool gives you more flexibility and can build your sketch with whatever options you like.

{{</ admonition >}}

At this point, your sketch has been turned into machine code, stored in `MyBlink.ino.cpp.o`. 
This file contains your `setup()` and `loop()` code, ready to be linked with the Arduino core and libraries in the next step.

### Compiling libraries
```cpp
Compiling libraries...
```
For the Blink sketch this step is empty. In the previous phase (*Detecting libraries used*) no additional libraries were found. 
Blink only relies on core Arduino functions such as `pinMode`, `digitalWrite`, and `delay`, which are part of the board core, not separate libraries.

In more advanced sketches the output looks different. 
For example, in **WiFiS3/ConnectWithWPA** the **WiFiS3** library is detected and its source files are compiled here.

### Compiling core

```bash
Compiling core...
Using previously compiled file: /home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/core/tmp_gen_c_files/pin_data.c.o
Using previously compiled file: /home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/core/tmp_gen_c_files/main.c.o
Using previously compiled file: /home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/core/tmp_gen_c_files/common_data.c.o
Using previously compiled file: /home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/core/variant.cpp.o
Using precompiled core: /home/kate/.cache/arduino/cores/arduino_renesas_uno_unor4wifi_4e1bf6711f2b98688d9a4a386931d6dc/core.a
```

The core is the foundation of every Arduino program. 
It provides the low-level code relevant to the specific board you selected, like startup code, 
pin mappings, and implementations of important functions. Instead of recompiling the same core files every time you build, 
the Arduino IDE uses precompiled objects from a cache. It speeds up the compilation.

## Linking everything together

Once all the individual files are compiled, the Arduino build system needs to link them into a single program.
I shortened the link command to present only the most important stuff:

```bash
arm-none-eabi-g++ \
  -mcpu=cortex-m4 -mfloat-abi=hard -mfpu=fpv4-sp-d16 \
  -o MyBlink.ino.elf \
  MyBlink.ino.cpp.o common_data.c.o main.c.o pin_data.c.o variant.cpp.o \
  libfsp.a core.a \
  -lstdc++ -lsupc++ -lm -lc -lgcc -lnosys
```

After this step, the final binary will be `MyBlink.ino.elf`.

Please note which libraries are linked into the build:
- `libfsp.a` → the Renesas Flexible Software Package, providing hardware drivers and low-level functions for peripherals.
- `core.a` → the Arduino core for this board. 
Libraries above are board support libraries. These are part of the Arduino board package (for the Uno R4 in this case). 
They are not optional user libraries, so they don’t appear in the detection phase.

Toolchain standard libraries:
- `-lstdc++` → the C++ standard library,
- `-lsupc++` → low-level C++ runtime support,
- `-lm` → the math library,
- `-lc` → the standard C library,
- `-lgcc` → helper routines from GCC itself,
- `-lnosys` → stubs for system calls.

## Finalizing build
### Creating binary and hex files

After the ELF file (`MyBlink.ino.elf`) is created, the build system uses `objcopy` to generate `hex` and `bin` formats:

```bash
arm-none-eabi-objcopy -O binary -j .text -j .data MyBlink.ino.elf MyBlink.ino.bin
arm-none-eabi-objcopy -O ihex   -j .text -j .data MyBlink.ino.elf MyBlink.ino.hex
```
Both formats contain the same program, just encoded differently for different flashing tools.

### Measuring the program size
Finally, the build system reports memory usage with `arm-none-eabi-size`:

```bash
arm-none-eabi-size -A MyBlink.ino.elf
```

### Cleaning the build
Unfortunately, Arduino IDE does not offer the `Clean build` or `Force rebuild` option ([[1]](https://forum.arduino.cc/t/feature-request-clean-build-option/1291789),
[[2]](https://forum.arduino.cc/t/can-i-force-the-arduino-ide-to-recompile-everything/866547), 
[[3]](https://github.com/arduino/arduino-ide/issues/419)). The workaround for it is to manually delete the cached build directories we mentioned earlier.
A much better alternative is to use Arduino CLI, which is more flexible and gives you full control over compilation and rebuilding.

## More reading

1. [Build Sketch Process from docs.arduino.cc](https://docs.arduino.cc/arduino-cli/sketch-build-process/)
2. [Find sketches, libraries, board cores and other files on your computer from support.arduino.cc](https://support.arduino.cc/hc/en-us/articles/4415103213714-Find-sketches-libraries-board-cores-and-other-files-on-your-computer)

### Digging deeper
3. [ARM Reverse Engineering Notes: Compilation](https://github.com/microbuilder/armreveng/blob/main/compilation.md)
4. [Open issues in arduino-cli related to build process](https://github.com/arduino/arduino-cli/issues?q=state%3Aopen%20label%3A%22topic%3A%20build-process%22)
5. [De-Mystifying Libraries - How Arduino IDE Finds and Uses Your Files - OhioIoT](https://www.youtube.com/watch?v=7vLjK9t-uZY)

