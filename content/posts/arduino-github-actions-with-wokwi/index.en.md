---
weight: 2
title: "Arduino Internals: running simulation on CI/CD"
date: 2025-11-18T15:58:26+08:00
lastmod: 2025-10-01T15:58:26+08:00
draft: true
author: "embeddedk8"
authorLink: "https://embeddedk8.com"
description: "Creating CI/CD pipeline with github actions and wokwi simulation"
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

Creating a simple CI/CD pipeline on github action with Wokwi simulation is very easy for Arduino.
First we will take a look on how to add building to github actions, then we will add wokwi simulation.

## Adding Arduino build to github actions

You can build your arduino project on github actions easily, because of existing actions `arduino/setup-arduino-cli@v2`,
which will install `arduino-cli` to your github workflow.

The minimal example is presented below:

```
  build:
    runs-on: ubuntu-latest
    outputs:
      firmware-path: ${{ steps.build.outputs.firmware_path }}
      
    steps:
      - name: Checkout
        uses: actions/checkout@v5

      - name: Install Arduino CLI
        uses: arduino/setup-arduino-cli@v2
        with:
          version: "1.3.1"

      - name: Setup Arduino CLI
        run: |
          arduino-cli core update-index
          arduino-cli core install arduino:avr

      - name: Compile Sketch (arduino:avr:uno for Wokwi)
        id: build
        run: |
          make release FQBN=arduino:avr:uno
          echo "firmware_path=./build/release/MyBlink.ino.hex" >> $GITHUB_OUTPUT
  
      - name: Upload firmware artifacts
        uses: actions/upload-artifact@v4
        with:
          name: firmware
          path: |
            ./build/release/MyBlink.ino.hex
            ./build/release/MyBlink.ino.elf
```

Steps:
1. Checkout - standard first step, to checkout the tested repository to github workflow. After this step, your repository is downloaded on github action job runner.
2. Install Arduino CLI - `uses: arduino/setup-arduino-cli@v2` ensures that `arduino-cli` is installed on your runner. You can specify specific version
with `version` option. I have chosen latest, `1.3.1` version.
3. Setup Arduino CLI - standard `arduino-cli` setup steps, that will download the core needed to build your application for selected board. 
Here, I have chosen `arduino:avr` because I plan to test/simulate it with wokwi, and `arduino:avr` is supported by wokwi (and Arduino Uno R4 Wifi is not, unfortunately).
4. Compile your application for selected board. I use the Makefile that I created. You can see Makefile [here](https://github.com/embeddedk8/MyBlink/blob/main/Makefile).
Because wokwi simulation is separate job, I export compiled binary (`.hex` and `.elf`), so next job can access it.

So summarizing: first job has built the binary for `arduino:avr:uno` with the use of Makefile, and uploads artifacts for next job.

## Run simulation with wokwi

Wokwi is free simulator for Arduino, ESP32, STM32 and Pi Pico for open source project, but you need to create an account to use it.
The commercial or private projects require paid plan, and for free we get 50 minutes of simulation time per month.

### Create an account in wokwi

First, create an account in [wokwi](https://wokwi.com/). You can choose free plan.

### Install wokwi-cli locally

Install wokwi-cli to test your setup locally, according to [this instruction](https://docs.wokwi.com/wokwi-ci/cli-installation).
To use `wokwi-cli` locally you need to create and export TOKEN from your account.

Go to [https://wokwi.com/dashboard/ci](https://wokwi.com/dashboard/ci) and create a new token. Then export it in your environment.
In Linux, you can add to .bashrc

```
export WOKWI_CLI_TOKEN=<xxx>
```

### Initialize wokwi project

To use wokwi, your project needs to contain two files:

#### wokwi.toml

Basic file describing version, board, elf and firmware location.
elf and firmware location must be relative to wokwi.toml file.
```
[wokwi]
version = 1
board = "arduino-uno"
elf = "build/release/MyBlink.ino.elf"
firmware = "build/release/MyBlink.ino.hex"
```

#### diagram.json

File describing connections. Following file describes no connections:
```
{
"version": 1,
"author": "Anonymous maker",
"editor": "wokwi",
"parts": [ { "id": "uno", "type": "wokwi-arduino-uno" } ],
"connections": [],
"serialMonitor": { "display": "always" }
}
```

You can use online creator to add new elements, like LEDs, buttons, etc. to your simulated board, and copy diagram.json from web.

### Run wokwi sim locally
To test that your wokwi setup works correctly, when you already have exported TOKEN and created two files, run
```
wokwi-cli --timeout 10000  --expect-text "Success"
```

Your app should print (write to Serial port) some text/data, and based on this data, your test case will succeed or fail.

This is the simplest simulation test for Arduino app. If it's suceeding, you're ready to add wokwi test case to github actions.

### Add wokwi simulation to github actions

First, add WOKWI_CLI_TOKEN as secret to your github repository settings. You can reuse the same TOKEN as you have locally or create new token.
Choose Settings -> Secrets and variables -> Actions -> New secret and name your token WOKWI_CLI_TOKEN.

### Add wokwi simulation job

The wokwi simulation job will reuse artifact from build job. 

test:
runs-on: ubuntu-latest
needs: build
```
    steps:
      - name: Checkout
        uses: actions/checkout@v5

      - name: Download firmware artifact
        uses: actions/download-artifact@v4
        with:
          name: firmware
          path: ./build/release

      - name: Test with Wokwi
        uses: wokwi/wokwi-ci-action@v1
        with:
          token: ${{ secrets.WOKWI_CLI_TOKEN }}
          path: ./ # directory with wokwi.toml, relative to repo's root
          expect_text: Success
          timeout: 30000
```

1 - Checkout - checkout the repository content.
2 - Download the build artifacts from `build` job (or, you can just build in the same job if you want).
3 - Run the test simulation - the same as you tested locally.

Now, on each push, your Arduino application is built and tested.
