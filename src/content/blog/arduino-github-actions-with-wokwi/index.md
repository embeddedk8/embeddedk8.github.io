---
weight: 2
title: "Adding CI/CD to Arduino projects: Github Actions and Wokwi simulation"
date: 2025-11-18T15:58:26+08:00
lastmod: 2025-10-01T15:58:26+08:00
pubDate: 'Nov 11 2025'
draft: false
author: "embeddedk8"
authorLink: "https://embeddedk8.com"
description: "Creating CI/CD pipeline for Arduino with github actions and wokwi simulation"
images: []
#resources:
#  - name: "featured-image"
#    src: "featured-image.png"

tags: ["Arduino Internals"]
categories: ["Arduino Internals"]

lightgallery: true

toc:
    auto: false
math:
    enable: true
---


Testing projects is one of the major challenges in embedded devices field. 
Many existing projects still rely on manual building by developers and
exclusive manual tests on the real hardware. In such case, pushing the change that breaks the compilation, 
or breaks the functionality of device, could go unnoticed for some time. 
An additional issue is that testing each change and iteration on real hardware is time-consuming for developers.

While nothing really can fully replace the end tests on the real hardware, we can (and should) introduce 
multiple layers of testing that can be done automatically, without effort from the developers side.

## Tools needed
In this post I will present one possible way of automating builds and tests for Arduino project. It will use:
- Arduino command line interface ([Arduino CLI](https://arduino.github.io/arduino-cli/1.3/)),
- automated builds with [Github Actions](https://github.com/features/actions),
- automated simulation with [Wokwi simulator](https://wokwi.com/) for simple testing.

With such approach, on each push to Github repository we will test on CI/CD that project builds and runs correctly.

### Arduino CLI
To build and simulate Arduino projects from the scripts in CI/CD jobs we need to use Arduino command line interface. 
If you're not familiar with it, you
can read my introduction: [Arduino Internals: building sketches with Arduino CLI](https://www.embeddedk8.com/arduino-cli-compilation/).

### Wokwi

**Wokwi** is a simulation platform that allows to run embedded project without using the real hardware.

It supports many [Arduino boards](https://wokwi.com/arduino), including:
- Arduino Uno (AVR),
- Arduino Mega,
- Arduino Nano.

With Wokwi, you can simulate the execution of an Arduino project and implement simple test cases based on 
the project’s serial output. In other words, you can build test cases that pass or fail depending on what the simulated device prints.

Wokwi is free to use, but it requires creating a free account.

### Github Actions
GitHub Actions is a GitHub feature that allows you to run CI/CD jobs directly on GitHub repositories. 
It is free for open-source projects and easy to set up.

Many important templates and actions are already implemented and ready to use. 
To work with Arduino projects, we need to install `arduino-cli` within GitHub Actions. 
For this, we can use the [setup-arduino-cli action](https://github.com/arduino/setup-arduino-cli) — we only need to include it in our workflow.

## Building our CI/CD pipeline 

Let's create a CI/CD pipeline that will build our project automatically (validate compilation) and
run and check for serial output (validate execution).

### Build Arduino sketch

The minimal example of Github Actions job that will build Arduino project is presented below:

```yaml
  build:
    runs-on: ubuntu-latest
      
    steps:
      # --- STEP 1: Checkout the repository ----------------------------------
      # This downloads your GitHub repository code (your Arduino project) into 
      # the virtual machine that runs this workflow. 
      - name: Checkout
        uses: actions/checkout@v5

      # --- STEP 2: Install Arduino CLI --------------------------------------
      # Arduino CLI is needed to build sketch from command line.
      # This action automatically installs the specified Arduino CLI version
      # on the GitHub Actions runner.
      - name: Install Arduino CLI
        uses: arduino/setup-arduino-cli@v2
        with:
          # You can also use "latest" instead of a fixed version.
          version: "1.3.1"

      # --- STEP 3: Install the required board core ---------------------------
      # Before compiling anything, Arduino CLI must know which board family
      # you want to build for.
      #
      # "arduino:avr" contains support for Arduino Uno, Nano, Mega, etc.
      # Wokwi (the simulator used later) also supports this family, so we
      # install it here.
      - name: Setup Arduino CLI
        run: |
          arduino-cli core update-index
          arduino-cli core install arduino:avr

      # --- STEP 4: Compile the sketch ----------------------------------------
      # This calls your Makefile to build the firmware.
      # FQBN (Fully Qualified Board Name) tells Arduino CLI which board
      # the code should be compiled for — here we use arduino:avr:uno.
      - name: Compile Sketch (arduino:avr:uno for Wokwi)
        id: build
        run: |
          make release FQBN=arduino:avr:uno

      # --- STEP 5: Upload compiled firmware as artifacts ---------------------
      # Since the next job cannot access this job's filesystem directly,
      # we upload the compiled firmware files (.hex and .elf) as artifacts.
      # GitHub stores them temporarily and makes them available to any
      # following jobs in the same workflow.
      - name: Upload firmware artifacts
        uses: actions/upload-artifact@v4
        with:
          name: firmware
          path: |
            ./build/release/MyBlink.ino.hex
            ./build/release/MyBlink.ino.elf
```

This job builds the Arduino Uno firmware using Makefile and exports the compiled artifacts 
so the next job can use them for simulation or deployment.

### Simulate execution with Wokwi

First, we need to create an account to use Wokwi. 

#### Create an account in Wokwi

Open [wokwi](https://wokwi.com/) to create an account. For personal project Wokwi is free so choose the Free plan.
In Free plan, we get 50 minutes of CI/CD simulation execution per month.

#### Create new Wokwi token

For using Wokwi, either locally or from Github Actions, we need to have the access token.

Go to [https://wokwi.com/dashboard/ci](https://wokwi.com/dashboard/ci) and create a new token. 

To use Wokwi from your PC (which will be helpful for debugging the setup) you need to export the token inside your
local envirnoment. For example, in Linux you can add the token to `.bashrc`:
```
export WOKWI_CLI_TOKEN=<xxx>
```

Reopen the terminal so changes are applied.

#### Install wokwi-cli locally

`wokwi-cli` is the Wokwi command line interface that is used to run the simulation from CI/CD jobs.
But it's also useful to have it locally for validating the simulation on host.

Install `wokwi-cli` locally, according to [this instruction](https://docs.wokwi.com/wokwi-ci/cli-installation).

#### Initialize Wokwi project

To use wokwi, your project needs to contain two files:

**wokwi.toml**

This is a basic file describing version, board, `elf` and `firmware` location.
`elf` and `firmware` paths must be relative to `wokwi.toml` file. Ensure they match your project layout.
```
[wokwi]
version = 1
board = "arduino-uno"
elf = "build/release/MyBlink.ino.elf"
firmware = "build/release/MyBlink.ino.hex"
```

**diagram.json**

File describing connections. My simple project contains no connections, so the `diagram.json` looks like this:
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

You can use [online creator](https://wokwi.com/projects/new/arduino-uno) to add new elements, like LEDs, buttons, etc. to your simulated board, 
and copy generated `diagram.json` from web.

#### Run Wokwi sim locally
To test that your Wokwi setup works correctly, run:
```
wokwi-cli --timeout 10000  --expect-text "Success"
```

This test runs the simulation and will succeed if application prints `"Success"`. (Obviuosly, you need to add such print to your application).
This is the simplest simulation test for Arduino app. If it's succeeding, you're ready to add Wokwi test case to Github Actions.

#### Add wokwi simulation to github actions

First, add `WOKWI_CLI_TOKEN` as a secret to your Github repository settings. You can reuse the same TOKEN as you have locally or create new token.
Choose `Settings -> Secrets and variables -> Actions -> New secret` and name your token WOKWI_CLI_TOKEN.

[![Adding a secret to Github repository](/github-secret.png "Adding a secret to Github repository")](/github-secret.png)

### Wokwi simulation

The Wokwi simulation job will reuse artifact from build job. 

```yaml
    test:
    runs-on: ubuntu-latest
    # This job will run after job `build` is finished.
    needs: build 
    
    steps:
      # --- STEP 1: Checkout the repository ----------------------------------
      - name: Checkout
        uses: actions/checkout@v5

      # --- STEP 2: Download firmware artifact --------------------------------
      # Download the compiled firmware files (.hex/.elf) produced in the 'build' job.
      # These artifacts are needed to run tests in the Wokwi simulator.
      - name: Download firmware artifact
        uses: actions/download-artifact@v4
        with:
          name: firmware
          path: ./build/release

      # --- STEP 3: Run tests using Wokwi simulator ---------------------------
      # This step runs the Arduino project in the Wokwi simulator.
      # It checks the serial output for the expected text to determine if the
      # test passes or fails.
      - name: Test with Wokwi
        uses: wokwi/wokwi-ci-action@v1
        with:
          token: ${{ secrets.WOKWI_CLI_TOKEN }}
          path: ./ # directory with wokwi.toml, relative to repo's root
          expect_text: Success
          timeout: 30000
```

Now, on each push, your Arduino application is built and tested.

## Example project

The described jobs are executed on simple [MyBlink project](https://github.com/embeddedk8/MyBlink).