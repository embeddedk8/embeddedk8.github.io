---
weight: 2
title: "Building Projects with Arduino CLI"
date: 2025-10-01T15:58:26+08:00
lastmod: 2025-10-01T15:58:26+08:00
draft: true
author: "embeddedk8"
authorLink: "https://embeddedk8.github.io"
description: "Compiling with Arduino CLI"
images: []
resources:
- name: "featured-image"
  src: "featured-image.png"

tags: ["Arduino"]
categories: ["Arduino"]

lightgallery: true

toc:
    auto: false
math:
    enable: true
---

In the [previous post](/arduino-ide-build-process/), we explored what really happens when you press **Verify/Compile** in the Arduino IDE.
It turned out that a lot of things go on behind the scenes - the classic steps of preprocessing, compiling, and linking, 
along with a few Arduino-specific twists in the process. All happening behind your back,
leaving you with almost no control over those actions. That’s the trade-off you accept for the IDE's simplicity.

Now, let’s take a more advanced approach and build the same project without the Arduino IDE - using the Arduino CLI.

# Compiling Arduino sketch via Arduino CLI

Ok, but why would we want to use CLI at the first place, when the Arduino IDE already provides such a simple way to build and upload sketches?
There are many reasons for that:
- **Advanced configuration options**

    Some build or configuration options aren't exposed in the IDE. With the CLI, you can fully control compiler flags, board settings, library versions.
- **Automation and integration**

  The CLI makes it easy to compile, verify, and upload sketches automatically. It can run on systems without a graphical interface, such as Docker containers.
- **Reproducibility**

    Makes sure that your collegue compiles exactly the same setup as you.
- **IDE independence**
    
    Use your favourite IDE for code development.

I am sure it was enough to convince you to give it a try, so let's start!

## Installing Arduino CLI
In September 2024, Arduino released a [major update to Arduino CLI](https://blog.arduino.cc/2024/09/05/arduino-cli-1-0-is-out/). 
As of October 2025, the latest version is Arduino CLI 1.3.1, which I'll be using here. 
Please refer to [official installation guide](https://docs.arduino.cc/arduino-cli/installation/) to install Arduino CLI.

{{< admonition note >}}
On Linux, I installed the Arduino CLI in second with command:
```
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
```
{{</ admonition >}}


Connect board to PC and run
```
arduino-cli core update-index

# Install needed boards definitions
arduino-cli core install arduino:renesas_uno
```

https://docs.arduino.cc/arduino-cli/getting-started/

You can create new sketch with
```
$ arduino-cli sketch new MyFirstSketch
Sketch created in: /home/luca/MyFirstSketch
```

But I want to reuse MyBlink sketch, that I was working on as in previous post.

```bash
cd ~/Arduino/MyBlink

arduino-cli compile --fqbn arduino:renesas_uno:unor4wifi ~/Arduino/MyBlink
```

Similar to what we observed in IDE, default output is quite concise.

arduino-cli compile --fqbn arduino:renesas_uno:unor4wifi ~/Arduino/MyBlink
Sketch uses 51880 bytes (19%) of program storage space. Maximum is 262144 bytes.
Global variables use 6740 bytes (20%) of dynamic memory, leaving 26028 bytes for local variables. Maximum is 32768 bytes.


I suggest to compile with Verbose output.
arduino-cli compile --fqbn arduino:renesas_uno:unor4wifi --verbose  ~/Arduino/MyBlink

Then upload
arduino-cli upload -p /dev/ttyACM0 --fqbn arduino:renesas_uno:unor4wifi --verbose ~/Arduino/MyBlink

How to check what port is your board connected?



https://docs.arduino.cc/arduino-cli/
https://arduino.github.io/arduino-cli/1.3/getting-started/
https://evan.widloski.com/notes/arduino_cli.html
https://dumblebots.com/blog/arduino-cli-getting-started