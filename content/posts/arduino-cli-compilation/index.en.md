---
weight: 2
title: "Arduino Internals: building sketches with Arduino CLI"
date: 2025-10-01T15:58:26+08:00
lastmod: 2025-10-01T15:58:26+08:00
draft: false
author: "embeddedk8"
authorLink: "https://embeddedk8.com"
description: "Build and upload sketches using Arduino CLI. Benefits, how to setup, upload sketches, configure, automate and create CI/CD pipeline"
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
Do you know that you don’t actually need the Arduino IDE to build and upload sketches?

Arduino projects can be compiled and uploaded straight from the command line using the **Arduino Command Line Interface (CLI)**. 
This process is identical to what happens when you build and upload from the IDE, because Arduino IDE 2.0 and later use `arduino-cli` under the hood.

By working directly with the CLI, you remove the IDE as a middle layer and gain more possibilities and control over your builds.

## Reasons to use Arduino CLI

If you were comfortable using IDE, you may not immediately see **why** would you use Arduino CLI instead.

Someone even asked about this more than seven years ago, and got one response like:
> ["If you have to ask what the benefits are then the benefits most likely do not apply to or interest you."](https://arduino.stackexchange.com/questions/56767/what-are-the-benefits-or-advantages-of-arduino-cli). 

That’s not entirely fair, though — it overlooks the fact that people want to learn new things. 
Arduino IDE is great for getting started, but you can do much more if you switch to Arduino CLI:

[//]: # (The names of list items are not matching the sentence flow)

- **Use advanced configuration options**

    Some build or configuration options aren't exposed in the Arduino IDE. 
    It's possible to configure them with configuration files, but this approach 
    can be complicated and harder to maintain —
    global configuration would affect all projects, per-board or per-sketch configuration would be tedious. 
    With the CLI, you can fully control compiler flags, board settings, library versions from command line,
    for each project separately.

- **Automate your builds and create CI/CD pipelines**

  Using the CLI, you can easily implement the scripts for tasks like building, uploading, deploying and testing the project.
  These scripts can run on lightweight systems without graphical interface, such as Docker containers.
  This makes possible to integrate Arduino project into the CI/CD pipeline for automated builds and testing.

- **Ensure reproducibility for your builds**

    When working in a team, using the Arduino CLI ensures that everyone builds the project with exactly the same setup and dependencies.
    This helps eliminate the classic “it works on my machine” problem and makes builds consistent across different environments.

- **Use your favourite IDE, not necessarily Arduino IDE**

  You don’t have to rely on the Arduino IDE to develop your projects.
  With the CLI, you can use your favorite code editor 
  — whether it’s for better IntelliSense, built-in integrations like GitHub Copilot, 
 or simply because you’re more comfortable with its shortcuts, workflow or looks.

- **Have full control over project dependencies**

    In Arduino IDE, only one version of a library can be installed at the same time. This becomes a real problem when
    you work on multiple projects that require different versions of the same library. This issue is solved when 
    using CLI — you can specify library versions directly from the command line, ensuring each one uses the correct dependencies.

Hopefully, that was enough to convince you to give the Arduino CLI a try!
Alright, it's time to get our hands dirty. We’ll install the Arduino CLI, set it up, and then build the project from the command line.

## Arduino CLI setup

In September 2024, Arduino released a [major update to Arduino CLI](https://blog.arduino.cc/2024/09/05/arduino-cli-1-0-is-out/).
As of October 2025, the latest version is Arduino CLI 1.3.1, which I'll be using here.
Please refer to [official installation guide](https://docs.arduino.cc/arduino-cli/installation/) to install Arduino CLI on your system.

### Installing Arduino CLI

{{< admonition note >}}
The quickest way to install the **Arduino CLI** on Linux is with a single command (check for [updates here!](https://docs.arduino.cc/arduino-cli/installation/)):
```
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
```

Other way, or if you have issues with above command, you can download a prebuilt binary from the **Download** section,
and manually add it to your PATH.
{{</ admonition >}}
{{< admonition warning >}}
⚠️ **Avoid installing arduino-cli with `snap`.**

The Snap package is not officially supported. It often causes permission and path issues (for example, [this one](https://github.com/arduino/arduino-cli/issues/1543)
— it happened to me when I used snap on Ubuntu 24.04).
If you’ve already installed it with `snap` and it's not working, remove it and reinstall using one of the methods above.
{{</ admonition >}}

### Check installation
After installing, type `arduino-cli` in your terminal, to confirm that the tool was installed successfully.

```bash
$ arduino-cli
Arduino Command Line Interface (arduino-cli).

Usage:
  arduino-cli [command]
  ...
```

Additionally, check if boards discovery works well:
```bash
$ arduino-cli board list
Port       Protocol Type        Board Name FQBN Core
/dev/ttyS4 serial   Serial Port Unknown
```

All good on my side! 

### Setup your board core

After Arduino CLI is installed, you need to install needed boards definitions [[1]](https://docs.arduino.cc/arduino-cli/getting-started/). First, let's update the board index:
```
arduino-cli core update-index
```

Then you need to install the core relevant for your board. Right now, we don't know which core id we need, 
so let's see what we can choose:
```
$ arduino-cli core search
Downloading index: package_index.tar.bz2 downloaded                                                                                                                                                                                                                                                                           
ID                       Version          Name
arduino:avr              1.8.6            Arduino AVR Boards
arduino:esp32            2.0.18-arduino.5 Arduino ESP32 Boards
arduino:megaavr          1.8.8            Arduino megaAVR Boards
arduino:nrf52            1.0.2            Arduino nRF52 Boards
arduino:renesas_uno      1.5.1            Arduino UNO R4 Boards
arduino:sam              1.6.12           Arduino SAM Boards (32-bits ARM Cortex-M3)
...
```
I have **Arduino Uno R4 WiFi**, so I need to use `arduino:renesas_uno` id.

I will install it with following command:
```
arduino-cli core install arduino:renesas_uno
```

### Initialize configuration

Initialize Arduino CLI configuration file for later usage:
```
arduino-cli config init
Config file written to: /home/kate/.arduino15/arduino-cli.yaml
```

The configuration options are described [here](https://arduino.github.io/arduino-cli/1.3/configuration/),
but for now let's leave it empty.

The preparations are done! It was easy, wasn't it?


## Basic usage
To start using Arduino CLI, you actually just need to use three basic commands: create new sketch, 
build a sketch and upload the binary to the board.

### Creating a new sketch

You can create new sketch with
```
$ cd Arduino
$ arduino-cli sketch new MyFirstSketch
Sketch created in: /home/kate/Arduino/MyFirstSketch
```

By default, the sketches are created inside current working directory.

### Compile a sketch
To compile a sketch, use `arduino-cli compile` command followed by:
- `--fqbn <id>` — your board id *(mandatory)*,
- `<sketch root dir>` — the path to root directory of the sketch to compile *(mandatory, unless you're inside the sketches root dir)*,
- `--verbose` — verbose flag to print all build logs to console *(if you want it)*.


I can compile MyBlink sketch with following command:

```bash
arduino-cli compile --fqbn arduino:renesas_uno:unor4wifi --verbose /home/kate/Arduino/MyBlink
```

### Uploading a sketch
Before we jump to upload command, we must now to which port is the board connected. How can we check it?
Good news — no need to observe `ls /dev/tty*` and plug and unplug the board. There is a command for it too:

```
$ arduino-cli board list
Port         Protocol Type              Board Name          FQBN                          Core
/dev/ttyACM0 serial   Serial Port (USB) Arduino UNO R4 WiFi arduino:renesas_uno:unor4wifi arduino:renesas_uno
```

Knowing the port, board id and sketch directory, the upload command looks like this:
```
arduino-cli upload -p /dev/ttyACM0 --fqbn arduino:renesas_uno:unor4wifi --verbose /home/kate/Arduino/MyBlink
```

So it was basically all needed to replace the usage of Arduino IDE **Verify/Compile** and **Upload** actions.

### Serial monitor

If your application sends data using `Serial.write()` or `Serial.print()`, 
you can view it using the `monitor` command in the Arduino CLI.

Make sure the baud rate in your monitor command matches the one you set in your sketch.
For example, if your code includes:
```
Serial.begin(115200);
```
then you should start the `monitor` with the same baud rate:
```
arduino-cli monitor -p /dev/ttyACM0 --config 115200
```

Using serial prints is one of the simplest ways to debug your Arduino applications.

## Advanced usage

### Specify build folder

By default, Arduino CLI places build artifacts in a temporary, system-specific folder — which can make it hard to inspect.
To keep your build outputs organized and easy to analyze, specify a custom build folder using the `--build-path` flag:

```
$ arduino-cli compile \
  /home/kate/Arduino/MyBlink \
  --fqbn arduino:renesas_uno:unor4wifi \
  --verbose  \
  --build-path /home/kate/Arduino/MyBlink/build
```

Now, all generated files are stored in the `build/` directory within your project:


```
~/Arduino/MyBlink/build$ tree -L 1
.
├── build.options.json
├── compile_commands.json
├── core
├── includes.cache
├── libraries
├── libraries.cache
├── MyBlink.ino.bin
├── MyBlink.ino.elf
├── MyBlink.ino.hex
├── MyBlink.ino.map
└── sketch

4 directories, 8 files
```

This layout makes it much easier to explore build files, inspect compilation issues, or integrate the build with external tools (like static analyzers).

### Customizing command

The compile command can be extended with additional stuff, like extra compiler flags or custom defines.

#### Custom defines
Let’s go back to our old MyBlink sketch. Currently, the LED blinks with a hardcoded delay of 1000 ms.
We can make this configurable at compile time by introducing a custom define called `BLINK_FREQUENCY`.

First, update the MyBlink sketch to use the new frequency.
If no value is provided from the command line, it will default to 1000 ms; otherwise, it will use the value you specify.

```
#ifndef BLINK_FREQUENCY
#define BLINK_FREQUENCY 1000
#endif

void loop() {
  Serial.write("Blinking");
  digitalWrite(LED_BUILTIN, HIGH);      // turn the LED on (HIGH is the voltage level)
  delay(BLINK_FREQUENCY);               // wait for a BLINK_FREQUENCY ms
  digitalWrite(LED_BUILTIN, LOW);       // turn the LED off by making the voltage LOW
  delay(BLINK_FREQUENCY);               // wait for a BLINK_FREQUENCY ms
}
```

By adjusting the compile command, you can easily change how fast the LED blinks.
For example, `build.extra_flags="-DBLINK_FREQUENCY=100"` part below sets the blink frequency to 100 ms:

```
arduino-cli compile --fqbn arduino:renesas_uno:unor4wifi --verbose --build-property build.extra_flags="-DBLINK_FREQUENCY=100"
```
<!---
#### Compilation flags
Another thing we can easily change with CLI with `build.extra_flags` are compilation flags, like 
creating debug or release version, change optimization level, etc. --->


#### Optimize for debug
The `--optimize-for-debug` flag adjusts compilation settings to make debugging easier.

You can review or modify its behavior in the `platform.txt` file.
When `--optimize-for-debug` is enabled,
the *debug* version of the optimization flags is applied; 
otherwise, the *release* version is used by default.
You can edit these flags in `platform.txt` to customize how each mode behaves.
```
compiler.optimization_flags.release=-Os
compiler.optimization_flags.debug=-Og -g
```

<!--- 
##### Example for debug version
For example, for debugging we
can turn off any optimization and include debug symbols, with `--build-property compiler.c.extra_flags="-g -O0"`,
and store the binary in `output/debug` folder.

```
arduino-cli compile --fqbn arduino:renesas_uno:unor4wifi --verbose  \
  /home/kate/Arduino/MyBlink \
  --build-property build.extra_flags="-g -O0" \
  --build-path /home/kate/Arduino/MyBlink/build/debug
```

##### Example for release version

For release, we can enable size (`-Os`) or speed optimizations (`-O2`) and optionally enable Link Time Optimization (`-flto`) [[1]](https://developer.arm.com/documentation/101458/2404/Optimize/Link-Time-Optimization--LTO-/What-is-Link-Time-Optimization--LTO-).

```
arduino-cli compile --fqbn arduino:renesas_uno:unor4wifi --verbose  /home/kate/Arduino/MyBlink --build-property compiler.c.extra_flags="-O2 -flto" --build-path /home/kate/Arduino/MyBlink/build/release
```

Full documentation of Arduino CLI commands is here: [https://arduino.github.io/arduino-cli/1.3/commands](https://arduino.github.io/arduino-cli/1.3/commands/arduino-cli_compile/)

--->
[//]: # (Give more examples)

### Permanent CLI settings

If you want to set permanent settings to your CLI, create a config file if you haven't:
```
arduino-cli config init
Config file written to: /home/kate/.arduino15/arduino-cli.yaml
```
Take a look, if you've just created it, it should be empty now:
```
arduino-cli config dump
board_manager:
additional_urls: []
```

Settings added globally to this file will affect all builds done with Arduino CLI. You can also set some options per-board.

[//]: # (## Serial monitor)

## Bonus
Do you feel somewhere in between IDE and CLI? Then you might like this cool tool — [Arduino CLI Manager on Github](https://github.com/abod8639/arduino-cli-manager).

It's simple, retro looking GUI wrapper for using Arduino CLI, that allows you build and upload sketches easily,
but unfortunately it's not exposing all customizations we discussed in this post.
```
                                                          
  ██████╗  █████╗ ██████╗  ██╗   ██╗██╗███╗   ██╗ ██████╗ 
  ██╔══██╗██╔══██╗██╔══██╗ ██║   ██║██║████╗  ██║██╔═══██╗
  ██████╔╝███████║██║  ██║ ██║   ██║██║██╔██╗ ██║██║   ██║
  ██╔══██║██╔══██║██║  ██║ ██║   ██║██║██║╚██╗██║██║   ██║
  ██████╔╝██║  ██║██████╔╝ ╚██████╔╝██║██║ ╚████║╚██████╔╝
  ╚═════╝ ╚═╝  ╚═╝╚═════╝   ╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝ 
 ┌────────────────────────────────────────────────────────┐
 │                 ARDUINO CLI MANAGER                    │
 │                                                        │
 │ Select board, serial, compile, upload & monitor easily │
 └────────────────────────────────────────────────────────┘
                           v1.0.8                           
────────────────────────────────────────────────────────────
 Project:     /home/kate/Arduino/MyBlink
 Board:       arduino:renesas_uno:unor4wifi
 Port:           /dev/ttyACM1
 Baud:           115200
────────────────────────────────────────────────────────────
 1 (S) Select/Create Project    
 2 (B) Select Board (FQBN)      
 3 (P) Select Port              
 5 (U) Upload Project           
 4 (C) Compile Project          
 6 (L) List Installed Cores     
 7 (A) List All Supported Boards
 8 (I) Install Core             
 9 (M) Open Serial Monitor      
 0 (E) Edit Project (nvim)      
────────────────────────────────────────────────────────────
 (Q) Quit
────────────────────────────────────────────────────────────
Enter your choice: 
```

## Summary
Using the Arduino CLI gives you full control over the build process, 
from compiling to uploading sketches, without relying on the Arduino IDE. 
It’s perfect for automation, reproducibility, and integrating Arduino projects into advanced workflows or CI/CD pipelines.

## More reading
- [https://docs.arduino.cc/arduino-cli/](https://docs.arduino.cc/arduino-cli/)
- [https://arduino.github.io/arduino-cli/1.3/getting-started/](https://arduino.github.io/arduino-cli/1.3/getting-started/)
- [https://evan.widloski.com/notes/arduino_cli.html](https://evan.widloski.com/notes/arduino_cli.html)
- [https://dumblebots.com/blog/arduino-cli-getting-started](https://dumblebots.com/blog/arduino-cli-getting-started)
- [https://www.pcbway.com/blog/Activities/Arduino_cli__compile__upload_and_manage_libraries__cores__and_boards.html](https://www.pcbway.com/blog/Activities/Arduino_cli__compile__upload_and_manage_libraries__cores__and_boards.html)
- [Arduino CLI - What and Why? | Breaking Out of Arduino IDE | Part 2 | Magpie Embedded](https://www.youtube.com/watch?v=Uk5_RKMf2Dk&t=356s)
- [Arduino CLI and the art of command line](https://www.youtube.com/watch?v=cVod8k713_8)
