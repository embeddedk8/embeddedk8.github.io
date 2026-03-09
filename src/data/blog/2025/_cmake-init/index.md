---
title: "cmake-init: the best way to kick off a new C or C++ project"
pubDatetime: 2025-12-20T15:58:26+08:00
draft: false
pubDate: 'Dec 20 2025'
description: "If you're tired of setting up the same boilerplates for testing, CI/CD, and linting every time you start a new repo, you should probably just use cmake-init tool."
slug: 'cmake-init'
tags: ["CMake", "C", "CPP", "Tools"]
---
When I was starting new C or C++ projects, I usually was either googling for a 
C project template, digging through dusty folders on my PC for an old one (that I *swore* I saved)
or just building it from scratch.

Starting from scratch meant the usual routine: 
manually creating directories, writing a basic `CMakeLists.txt`, and setting up initial source files. 
Then, as the project grew, I’d spend time adding the tests structure, CI/CD pipelines, and linters. It was a massive time sink, but for a long time I didn't know about any shortcuts.

Does it sound familiar? If yes, I have an awesome solution for you.

### Use the CMake project initializer!

It turns out the solution has been around for a couple of years. 
I'm honestly not sure how I missed it, but I just discovered it recently.

It's called [cmake-init](https://github.com/friendlyanon/cmake-init). 
It's an open-source tool that does all the boring work of setting up a C or C++ project for you. 
It gives you a clean structure, a solid CMake setup, initializes some basic Github Actions flow, 
and enables some checks and linters, that
you usually would have to add yourself.

## What `cmake-init` actually does
After answering a few simple questions during setup, you get a clean C or C++ project that includes:
- Modern CMake structure that actually follows best practices.
- Built-in versioning so you don't have to hardcode version numbers.
- Unit test templates ready to start implementing the test logic.
- GitHub Actions CI/CD that runs linters, coverage, and sanitizers on Windows, Linux, and macOS.
- Doxygen documentation support.
- Package manager integration (like Vcpkg or Conan).

It's basically everything you need to start coding immediately without wasting time on setup.

What really surprised me was how smoothly it worked. 
Usually, I expect to spend some time on fighting with a new tool to get it running, 
but this one just worked on the first try.

## A quick setup note for Ubuntu 24.04

The official instructions tell you to `pip install cmake-init`, 
but if you're on Ubuntu 24.04 or any recent distro, 
you'll probably run into the `externally-managed-environment error`.

```
kate@kate-Legion-Y540-15IRH-PG0:~$ pip install cmake-init
error: externally-managed-environment

× This environment is externally managed
...
```

Basically, Linux doesn't want you installing Python packages globally anymore. 
Since you only need to run `cmake-init` once to kick off your project, you have two easy ways around this:


### pipx
`pipx` installs the tool in its own isolated environment but makes the command available everywhere.

```bash
sudo apt install pipx
pipx install cmake-init
```

### Manual virtual environment

If you don't want to install `pipx`, you can just create a virtual environment and install `cmake-init` there.
You only need to run `cmake-init` once, so after initializing you can remove this virtual environment.

```
python -m venv myenv
source myenv/bin/activate
pip install cmake-init
```


## Usage
To initialize project, simply call:
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

Once your project is live, the CI/CD pipeline will automatically check your code formatting. 
If you enabled the linter during setup and your local code doesn't match the project style, the CI job will fail.

If that happens, you'll see an error message in your GitHub Actions like this:
```
Run cmake -D FORMAT_COMMAND=clang-format-18 -P cmake/lint.cmake
cmake -D FORMAT_COMMAND=clang-format-18 -P cmake/lint.cmake
The following files are badly formatted:
...

CMake Error at cmake/lint.cmake:50 (message):
Run again with FIX=YES to fix these files.
```

To fix this locally, make sure you have the right version of `clang-format` installed:
```
sudo apt install clang-format-18
```

Then, run the command suggested in the error message, but add `-D FIX=YES` to tell CMake to actually apply the changes:

```
cmake -D FORMAT_COMMAND=clang-format-18 -D FIX=YES -P cmake/lint.cmake
```
Now your files are reformatted. Just review the changes, commit, and push again.

## Sanitizers jobs

Watch the output of sanitizers jobs. Warnings are not failing the job, and have important insights.

## Example project
The new project created with `cmake-init` is here: [mini_armv6_emulator](https://github.com/kasia0x01/mini_armv6_emulator).