# Building projects with Arduino CLI


In the [previous post](/arduino-ide-build-process/) we took a closer look on build process in the Arduino IDE.
It turned out that a lot of things go on behind the scenes - the classic steps of preprocessing, compiling, and linking, 
along with a few Arduino-specific addons to the process. 

Now, let’s take a more advanced approach and build the same project without the Arduino IDE - using the Arduino CLI.

# Compiling Arduino sketch via Arduino CLI

Ok, but why would we want to use CLI at the first place, when the Arduino IDE already provides such a simple way to build and upload sketches?
Maybe, because of...
- **Advanced configuration options**

    Some build or configuration options aren't exposed in the IDE. With the CLI, you can fully control compiler flags, board settings, library versions from command line.
- **Automation and integration**

  The CLI makes it easy to compile, verify, and upload sketches automatically. It can run on systems without a graphical interface, such as Docker containers.
- **Reproducibility**

    Makes sure that your colleague compiles with exactly the same setup as you.
- **IDE independence**
    
    Use your favourite IDE for code development!

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

### Setup your board core

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

But I want to reuse MyBlink sketch, that I was working on as in previous post.

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
Good news - no need to observe `ls /dev/tty*` with board plugged and unplugged. There is a command for it too:

```
arduino-cli board list
Port         Protocol Type              Board Name          FQBN                          Core
/dev/ttyACM0 serial   Serial Port (USB) Arduino UNO R4 WiFi arduino:renesas_uno:unor4wifi arduino:renesas_uno
```

Knowing the port, board ID and sketch directory, the upload command looks like this:
```
arduino-cli upload -p /dev/ttyACM0 --fqbn arduino:renesas_uno:unor4wifi --verbose /home/kate/Arduino/MyBlink
```

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

{{< admonition info >}}
This blog post is still work in progress... It will be updated soon!
{{</ admonition >}}

## More reading
- [https://docs.arduino.cc/arduino-cli/](https://docs.arduino.cc/arduino-cli/)
- [https://arduino.github.io/arduino-cli/1.3/getting-started/](https://arduino.github.io/arduino-cli/1.3/getting-started/)
- [https://evan.widloski.com/notes/arduino_cli.html](https://evan.widloski.com/notes/arduino_cli.html)
- [https://dumblebots.com/blog/arduino-cli-getting-started](https://dumblebots.com/blog/arduino-cli-getting-started)

[comment]: # (TODO: platform.txt?)
