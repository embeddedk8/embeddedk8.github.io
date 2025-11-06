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

In the [previous post](/arduino-ide-build-process/) we took a closer look at how the Arduino IDE builds sketches.

Arduino also offers another way to build projects — by using the **Arduino Command Line Interface (CLI)** directly.
Starting with Arduino IDE 2.0, the IDE actually uses `arduino-cli` under the hood the build process, 
so working with the CLI directly simply removes one layer of abstraction 
while following the exact same steps — but with better flexibility and possibilities.


## Reasons to use Arduino CLI
I’m sure some of you might not immediately see **why** would you use Arduino CLI instead of Arduino IDE.
Someone once wrote, 
> ["If you have to ask what the benefits are then the benefits most likely do not apply to or interest you."](https://arduino.stackexchange.com/questions/56767/what-are-the-benefits-or-advantages-of-arduino-cli). 

But I don't agree with that! These benefits might actually apply to you — you just might not realize it yet.

Arduino IDE is great for getting started, but you can do much more if you switch to Arduino CLI:

- **Easier configuration**

    Some build or configuration options aren't exposed in the Arduino IDE. 
    It's possible to configure them with configuration files, but this approach 
    can be complicated and harder to maintain —
    global configuration would affect all projects, per-board or per-sketch configuration would be tedious. 
    With the CLI, you can fully control compiler flags, board settings, library versions from command line,
    for each project separately.

- **Automation and integration**

  Using the CLI, you can easily implement the scripts for tasks like building, uploading, deploying and testing the project.
  These scripts can run on lightweight systems without graphical interface, such as Docker containers.
  This makes possible to integrate Arduino project into the CI/CD pipeline for automated builds and testing.

- **Reproducibility**

    When working in a team, using the Arduino CLI ensures that everyone builds the project with exactly the same setup and dependencies.
    This helps eliminate the classic “it works on my machine” problem and makes builds consistent across different environments.

- **IDE independence**

  You don’t have to rely on the Arduino IDE to develop your projects.
  With the CLI, you can use your favorite code editor 
  — whether it’s for better IntelliSense, built-in integrations like GitHub Copilot, 
 or simply because you’re more comfortable with its shortcuts, workflow or looks.

- **Dependency control**

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

Then you need to install the core relevant for your board. Right now, we don't know what is the core id that we need.
So let's peek what we can choose:
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
Ok, so it's clear now, that for Arduino UNO R4 WiFi that I have I need to use `arduino:renesas_uno` ID.
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

The configuration options are described [here](https://arduino.github.io/arduino-cli/1.3/configuration/).

The preparations are done! It was easy, wasn't it?


## Basic usage
To start using Arduino CLI, you actually just need to use three basic commands: create new sketch, build a sketch and upload the binary to the board.

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
- `--fqbn <id>` - your board id,
- `<sketch root dir>` - the path to root directory of the sketch to compile,
- `--verbose` - verbose flag to print all build logs to console.

So to compile MyBlink that was previously compiled with the IDE, I will use:

```bash
arduino-cli compile --fqbn arduino:renesas_uno:unor4wifi --verbose /home/kate/Arduino/MyBlink
```


### Uploading a sketch
Before we jump to upload command, we must now to which port is the board connected. How can we check it?
Good news — no need to observe `ls /dev/tty*` with board plugged and unplugged. There is a command for it too:

```
arduino-cli board list
Port         Protocol Type              Board Name          FQBN                          Core
/dev/ttyACM0 serial   Serial Port (USB) Arduino UNO R4 WiFi arduino:renesas_uno:unor4wifi arduino:renesas_uno
```

Knowing the port, board ID and sketch directory, the upload command looks like this:
```
arduino-cli upload -p /dev/ttyACM0 --fqbn arduino:renesas_uno:unor4wifi --verbose /home/kate/Arduino/MyBlink
```

So it was basically all needed to replace the usage of Arduino IDE **Verify/Compile** and **Upload** actions.


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

This layout makes it much easier to explore intermediate files, inspect compiler output, or integrate the build with external tools (like static analyzers).

### Customizing command

The compile command can be extended with additional stuff, like extra compiler flags:

```
arduino-cli compile --fqbn arduino:renesas_uno:unor4wifi --verbose  /home/kate/Arduino/MyBlink --build-property compiler.c.extra_flags="-Wall -O2"
```

Full documentation of Arduino CLI commands is here: [https://arduino.github.io/arduino-cli/1.3/commands](https://arduino.github.io/arduino-cli/1.3/commands/arduino-cli_compile/)

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
