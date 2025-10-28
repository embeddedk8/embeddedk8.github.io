# Arduino Internals: building sketches with Arduino CLI


In the [previous post](/arduino-ide-build-process/) we took a closer look at how the Arduino IDE builds sketches.

Arduino also offers another way to build projects — by using the **Arduino Command Line Interface (CLI)** directly.
Starting with Arduino IDE 2.0, the IDE actually uses `arduino-cli` under the hood the build process, 
so working with the CLI directly simply removes one layer of abstraction 
while following the exact same steps — but with better flexibility and possibilities.


## Why should you use Arduino CLI?
While the Arduino IDE is great for getting started, the Arduino Command Line Interface offers 
much more control and flexibility. Here are some of the key benefits you gain by using it:

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

## Installing Arduino CLI
In September 2024, Arduino released a [major update to Arduino CLI](https://blog.arduino.cc/2024/09/05/arduino-cli-1-0-is-out/). 
As of October 2025, the latest version is Arduino CLI 1.3.1, which I'll be using here. 
Please refer to [official installation guide](https://docs.arduino.cc/arduino-cli/installation/) to install Arduino CLI on your system. 

{{< admonition note >}}
On Linux, I installed the Arduino CLI in just a few seconds with just one command:
```
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
```
{{</ admonition >}}

After installing, type `arduino-cli` in your terminal, to confirm that the tool was installed successfully.

```bash
$ arduino-cli
Arduino Command Line Interface (arduino-cli).

Usage:
  arduino-cli [command]

Examples:
  /snap/arduino-cli/62/usr/bin/arduino-cli <command> [flags...]

Available Commands:
  board           Arduino board commands.
  ...
```
All good on my side! 

## Setup your board core

After Arduino CLI is installed, you need to install needed boards definitions [[1]](https://docs.arduino.cc/arduino-cli/getting-started/). First, let's update the board index:
```
arduino-cli core update-index
```

Then you need to install the core relevant for your board. Right now, we don't know what is the core id that we need.
So let's peek what we can choose:
```
~/Arduino/MyBlink$ arduino-cli core search
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

The preparations are done! It was easy, wasn't it?

## Creating a new sketch

You can create new sketch with
```
$ arduino-cli sketch new MyFirstSketch
Sketch created in: /XXX/MyFirstSketch
```

But I want to reuse MyBlink sketch, that I was already working on, as in previous post.

## Compile a sketch
To compile a sketch, use `arduino-cli compile` command followed by:
- `--fqbn <id>` - your board id,
- `<sketch root dir>` - the path to root directory of the sketch to compile.

So to compile MyBlink that was previously compiled with the IDE, I will use:

```bash
arduino-cli compile --fqbn arduino:renesas_uno:unor4wifi /home/kate/Arduino/MyBlink
```

Again, like we already saw in IDE, the default output is very concise.

```bash
arduino-cli compile --fqbn arduino:renesas_uno:unor4wifi /home/kate/Arduino/MyBlink
Sketch uses 51880 bytes (19%) of program storage space. Maximum is 262144 bytes.
Global variables use 6740 bytes (20%) of dynamic memory, leaving 26028 bytes for local variables. Maximum is 32768 bytes.
```

We can **enable verbose output** here too.
```bash
arduino-cli compile --fqbn arduino:renesas_uno:unor4wifi --verbose  /home/kate/Arduino/MyBlink
```

## Uploading a sketch
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

## Customizing command

The compile command can be extended with additional stuff, like extra compiler flags:

```
arduino-cli compile --fqbn arduino:renesas_uno:unor4wifi --verbose  /home/kate/Arduino/MyBlink --build-property compiler.c.extra_flags="-Wall -O2"
```

Full documentation of Arduino CLI commands is here: [https://arduino.github.io/arduino-cli/1.3/commands](https://arduino.github.io/arduino-cli/1.3/commands/arduino-cli_compile/)

## Permanent CLI settings

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

