# Arduino Internals: building sketches with Arduino CLI


In the [previous post](/arduino-ide-build-process/) we took a closer look at how the Arduino IDE builds sketches.
A lot happens behind the scenes — from the classic C/C++ build steps (preprocessing, compiling, assembling, and linking) 
to a few Arduino-specific additions.

Now, let’s take things a step further and build the same project without the Arduino IDE — this time using the Arduino CLI (Arduino
Command Line Interface).

# Compiling Arduino sketch via Arduino CLI

It’s worth to start with mentioning that, starting with Arduino IDE 2.0, the Arduino IDE uses the Arduino CLI
for the build process. This means that when you build a sketch using the CLI directly, it follows exactly the same steps as the IDE does.

So, what’s the point of using the CLI directly?

There are several advantages:

- **Advanced configuration options**

    Some build or configuration options aren't exposed in the IDE. It's possible to configure them via configuration files
    for the IDE, but it makes this process more complicated and harder to maintain (the configuration file can be per-sketch or global).
    With the CLI, you can fully control compiler flags, board settings, library versions from command line.

- **Automation and integration**

  The CLI makes it easy to compile, verify, and upload sketches automatically. 
  It can run on systems without a graphical interface, such as Docker containers.
  We will try to use it for creating simple CI/CD pipeline later.

- **Reproducibility**

    Makes sure that your colleague compiles with exactly the same setup as you. It solves the "it works on my machine" problem.

- **IDE independence**
    
    Use your favourite IDE for code development! You don't have to use Arduino IDE if you don't want!

I am sure it was enough to convince you to give it a try, so let's start!


## Installing Arduino CLI
In September 2024, Arduino released a [major update to Arduino CLI](https://blog.arduino.cc/2024/09/05/arduino-cli-1-0-is-out/). 
As of October 2025, the latest version is Arduino CLI 1.3.1, which I'll be using here. 
Please refer to [official installation guide](https://docs.arduino.cc/arduino-cli/installation/) to install Arduino CLI. 

{{< admonition note >}}
On Linux, I installed the Arduino CLI in just a few seconds with just one command:
```
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
```
{{</ admonition >}}

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
So let's install needed boards definitions:
```
arduino-cli core install arduino:renesas_uno
 ```

The preparations are done!

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
In the next post, we’ll explore how to automate builds and uploads.

## More reading
- [https://docs.arduino.cc/arduino-cli/](https://docs.arduino.cc/arduino-cli/)
- [https://arduino.github.io/arduino-cli/1.3/getting-started/](https://arduino.github.io/arduino-cli/1.3/getting-started/)
- [https://evan.widloski.com/notes/arduino_cli.html](https://evan.widloski.com/notes/arduino_cli.html)
- [https://dumblebots.com/blog/arduino-cli-getting-started](https://dumblebots.com/blog/arduino-cli-getting-started)
- [https://www.pcbway.com/blog/Activities/Arduino_cli__compile__upload_and_manage_libraries__cores__and_boards.html](https://www.pcbway.com/blog/Activities/Arduino_cli__compile__upload_and_manage_libraries__cores__and_boards.html)


