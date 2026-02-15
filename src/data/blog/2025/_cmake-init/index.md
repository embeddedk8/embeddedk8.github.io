---
weight: 2
title: "Cmake-init as a best way to initialize C and C++ projects"
pubDatetime: 2025-12-20T15:58:26+08:00
draft: false
pubDate: 'Dec 20 2025'
author: "embeddedk8"
authorLink: "https://embeddedk8.com"
description: "An introduction to cmake-init, an open-source tool for generating modern CMake projects with built-in support for tests, linters, and CI/CD pipelines."
images: []
resources:
slug: 'cmake-init'
tags: ["CMake", "C", "CPP", "Tools"]

lightgallery: true

toc:
  auto: false
math:
  enable: true
---
When I was starting new C or C++ projects, my usual approach was either googling for a 
“C project template”, digging through my old templates saved on my PC (because I stored them, didn't I?) 
or just building a fresh project from scratch: like set up directories, add initial source files and write a simple CMake.
After that, the project structure would evolve naturally as I added tests, CI/CD, and other features.

This setup used to take a large chunk of my time, 
and sometimes configuring additional quality tools felt like a real challenge. 
Yet, I had never heard of any real shortcuts beyond reusing my old templates.

Does it sound like you? If yes, I have something that will literally change how you kick off a new project.

### Just use the CMake project initializer

It turns out the ideal solution has been around for four years, but I somehow didn't know about it, and I only just discovered it now.

Meet [cmake-init](https://github.com/friendlyanon/cmake-init) — an awesome open-source project 
that can completely tale care of creating your C/C++ projects with a professional structure, ready-made CMake setup, testing, and more.

## What `cmake-init` can do
With a very short setup (just answer a few simple questions) we receive a perfect C or C++ project structure with:
- Advanced CMake structure
- Built-in versioning
- Unit tests template
- CI/CD on GitHub Actions running linters, coverage, sanitizers, and tests on Windows, Linux, and macOS
- Debug and release builds
- Doxygen documentation
- Package manager integration

It’s basically everything you need to start developing your project without wasting time on setup.

What really surprised me was how smoothly it just worked. 
Usually, my experience with random open-source tools is that they require a fair bit of fighting before anything actually works.
But this one just worked, effortlessly.

## A quick setup note for Ubuntu 24.04

The instruction mentions to install `cmake-init` via the `pip install` command, 
but Ubuntu 24.04 does not accept installing packages globally.
```
kate@kate-Legion-Y540-15IRH-PG0:~$ pip install cmake-init
error: externally-managed-environment

× This environment is externally managed
╰─> To install Python packages system-wide, try apt install
python3-xyz, where xyz is the package you are trying to
install.

    If you wish to install a non-Debian-packaged Python package,
    create a virtual environment using python3 -m venv path/to/venv.
    Then use path/to/venv/bin/python and path/to/venv/bin/pip. Make
    sure you have python3-full installed.
    
    If you wish to install a non-Debian packaged Python application,
    it may be easiest to use pipx install xyz, which will manage a
    virtual environment for you. Make sure you have pipx installed.
    
    See /usr/share/doc/python3.12/README.venv for more information.

note: If you believe this is a mistake, please contact your Python 
installation or OS distribution provider. You can override this, at 
the risk of breaking your Python installation or OS, by passing 
--break-system-packages.
hint: See PEP 668 for the detailed specification.
```

To install `cmake-init`, I had to create a python virtual environment and 
install `cmake-init` inside it. My project didn't need python virtual environment, but 
you only need to run `cmake-init` once, so it's not a big cost for what you get.

```
python -m venv myenv
source myenv/bin/activate
pip install cmake-init
```

Then, to initialize project, simply call:
```
cmake-init <root path of your project>
```

If you want to migrate existing project to a new structure, add `--overwrite` (it won't migrate your code, 
but new directories and CMakeLists.txt file will be created.
You need to move your sources and update CMakeLists.txt yourself):
```
cmake-init <path> --overwrite
```

After the project is initialized, check the created `BUILDING.md` for build instructions.

## Formatter failures

Now, your project is tested on CI/CD automatically. If you enabled linter, and linter finds some files are wrongly formatted, you need to fix it locally.
For this purpose, you need to install the proper `clang-format`. In failure message, in my project I see:
```
Run cmake -D FORMAT_COMMAND=clang-format-18 -P cmake/lint.cmake
cmake -D FORMAT_COMMAND=clang-format-18 -P cmake/lint.cmake
The following files are badly formatted:
...

CMake Error at cmake/lint.cmake:50 (message):
Run again with FIX=YES to fix these files.
```

If you don't have it installed yet, first install proper formatter:
```
sudo apt install clang-format-18
```

and run it locally with suggested flag `-D FIX=YES` (check YOUR original command in CI/CD, as it may differ among versions):

```
cmake -D FORMAT_COMMAND=clang-format-18 -D FIX=YES -P cmake/lint.cmake
```
Now, files are automatically reformatted. You can review the changes and push.

## Sanitizers jobs

Watch the output of sanitizers jobs. Warnings are not failing the job, and have important insights.

## Example project
The new project created with `cmake-init` is here: [mini_armv6_emulator](https://github.com/embeddedk8/mini_armv6_emulator).