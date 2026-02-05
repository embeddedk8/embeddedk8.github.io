---
title: "Checking the Bazel build system for the first time"
description: "I'm testing how difficult it is to get started with the Bazel build system for a C application without using AI."
pubDatetime: 2026-01-29T15:58:26+08:00
tags: ["Bazel"]
draft: true
slug: 'first-bazel-build'
---

I've heard a lot about Bazel build system recently and wanted to see how hard it is to use it without any prior experience.
Bazel is said to be totally different from CMake and Make, both of which I've used before for C and C++ project (mostly for embedded devices). 

Some things that look interesting for me are:

- **Hermeticity**

Bazel promises that the builds are [hermetic](https://bazel.build/basics/hermeticity), which means that will always produce the same output,
regardless of host environment,
because it will not use any libraries or other software installed on compiling machine.
I've personally experienced issues of non-hermetic builds when using CMake or Make -- for example when newer GCC failed compilation,
while older one passed, or when linked GLIBC differed across hosts. 


Complaints:

- I saw many rants saying Bazel is too complicated and hard to use (like [Bazel is ruining my life](https://www.reddit.com/r/devops/comments/1c2g3s4/bazel_is_ruining_my_life/))
or [I hate Bazel. A build system for C/C++ should not require a Java JVM. Please keep Java out of microcontroller ecosystem please.](https://news.ycombinator.com/item?id=41196123)
  (Of course I agree to this one! Does C++ Bazel really requires JVM?)
- Starting basic new project took ~1 day with troubleshooting, while it would take a minute when using Make

## First look on bazel.build

Bazel is a build system for various languages. The main supported languages are C++, Java, Android, iOS, Go.
It's actually nice to learn the system that can be useful in variety of projects.

I went to https://bazel.build/ to get started. The site is not very fancy, but I like the motto: `{ Fast, Correct } — Choose two`.
I clicked the `Install Bazel` button and moved forward.

### Installing Bazel

For Ubuntu, the recommended way is to use `Bazelisk` to install Bazel. Sounds like a Bazel-specific installation tool. 

The Bazelisk is hosted on [github](https://github.com/bazelbuild/bazelisk/blob/master/README.md). For Linux they recommend to download the binary,
unless you are a web developer who uses npm, then you can install it with npm.

I have a blog, which means I am a web developer. I choose npm and it looks that it installed correctly.

```
sudo npm install -g @bazel/bazelisk
[sudo] password for kate: 

added 1 package in 2s
```

Ok. What's next? I am typing the 'bazelisk' command in my command line. It looks `bazelisk` is working fine.

```
kate@kate-Legion-Y540-15IRH-PG0:~/embeddedk8/embeddedk8.github.io$ bazelisk
2026/01/29 10:35:34 Downloading https://releases.bazel.build/9.0.0/release/bazel-9.0.0-linux-x86_64...
Downloading: 62 MB out of 62 MB (100%) 
WARNING: Invoking Bazel in batch mode since it is not invoked from within a workspace (below a directory having a MODULE.bazel file).
Extracting Bazel installation...
OpenJDK 64-Bit Server VM warning: Options -Xverify:none and -noverify were deprecated in JDK 13 and will likely be removed in a future release.
                                                           [bazel release 9.0.0]
Usage: bazel <command> <options> ...

Available commands:
  aquery              Analyzes the given targets and queries the action graph.
  ...
  (cropped)
```

## Starting new project

Once Bazelisk is installed, and I see that the command `bazelisk` works, I need to know how to create a new project.
The available commands do not include any `bazel start`, or `bazel create` shortcut that would create a new project template for me.
(Or I just don't see it, remember I am a noob).
I need to read some docs. I am going back to home page of Bazel and navigate to [First build guides](https://bazel.build/start).
I am choosing a C++ tutorial. It's probably the same for C? The estimated length of following the tutorial is 30 mins. I can do it.

I am cloning the Bazel C++ examples repo and starting the 3-staged tutorial.

## 1-st stage: one file program

At first I am just compiling the example:

```
bazel build //main:hello-world
Starting local Bazel server (9.0.0) and connecting to it...
WARNING: For repository 'rules_cc', the root module requires module version rules_cc@0.0.17, but got rules_cc@0.2.14 in the resolved dependency graph. Please update the version in your MODULE.bazel or set --check_direct_dependencies=off
INFO: Analyzed target //main:hello-world (85 packages loaded, 466 targets configured).
INFO: Found 1 target...
Target //main:hello-world up-to-date:
  bazel-bin/main/hello-world
INFO: Elapsed time: 15.021s, Critical Path: 0.48s
INFO: 7 processes: 5 internal, 2 processwrapper-sandbox.
INFO: Build completed successfully, 7 total actions
```
The log prints the executable path. So one way of running the binary is directly run it:

```
./bazel-bin/main/hello-world
Hello world
Thu Jan 29 11:04:39 2026
```

Other way is to use `bazel run //main:hello-world` command. 

What feels weird of difficult for me is that I need to specify the target name in format `//main:hello-world`. Feels a bit too complicated --
I only have one program inside current directory, in directory `main`. But when I try building with changed name, it complains:

```
bazel run //main:hello-world2
WARNING: Target pattern parsing failed.
ERROR: Skipping '//main:hello-world2': no such target '//main:hello-world2': target 'hello-world2' not declared in package 'main' defined by /home/kate/embeddedk8/examples/cpp-tutorial/stage1/main/BUILD (did you mean hello-world?)
ERROR: no such target '//main:hello-world2': target 'hello-world2' not declared in package 'main' defined by /home/kate/embeddedk8/examples/cpp-tutorial/stage1/main/BUILD (did you mean hello-world?)
INFO: Elapsed time: 0.101s
INFO: 0 processes.
ERROR: Build did NOT complete successfully
ERROR: Build failed. Not running target
```

so I am guessing that inside one `main` directory I can have multiple targets, that's why I need to be precise with target name. 

Could we at least drop the traing `\\` ? Checking.

```
bazel run main:hello-world
INFO: Analyzed target //main:hello-world (0 packages loaded, 0 targets configured).
INFO: Found 1 target...
Target //main:hello-world up-to-date:
  bazel-bin/main/hello-world
INFO: Elapsed time: 0.200s, Critical Path: 0.00s
INFO: 1 process: 1 internal.
INFO: Build completed successfully, 1 total action
INFO: Running command line: bazel-bin/main/hello-world
Hello world
```

It looks it works this way too. Maybe I will learn soon why tutorial shows it with `\\`.

## Stage 1: Creating my own one-file program

Ok, the example project is building and running, I want to create my own project to practicize it more.
It's always easier to learn by doing than just reading existing code.

I am creating new directory with a source file: `hello/main/main.c`. My program is even more minimal:
```
#include <stdio.h>

int main() {
    printf("Hello world!\n");
    return 0;
}
```

After `main.c` I create `BUILD` file in the same dir as `main.c`. In the C++ app, it looked like this:

```
load("@rules_cc//cc:cc_binary.bzl", "cc_binary")

cc_binary(
    name = "hello-world",
    srcs = ["hello-world.cc"],
)
```

For my app, I am creating similar file. Not sure if `load` can stay like it was. We will see. I am renaming target to `app` and adjusting the source file name.

```
load("@rules_cc//cc:cc_binary.bzl", "cc_binary")

cc_binary(
    name = "app",
    srcs = ["main.c"],
)
```

Now, I need to create `MODULE.bazel` file in upper directory from `main` dir. I will paste the same content as it had for C++ hello app.
```
bazel_dep(name = "rules_cc", version = "0.0.17")
```

Trying to compile:

```
bazel run //main:app
```

Well, it just worked. But I didn't need to make a lot of changes against the Stage1 example.

## Stage 2: Adding the library to the program

In Stage2 of tutorial, it's shown how to add the library target to a build. I will add a library that writes a log to file,
to make the app sligthly more complicated (maybe there will be some complication on writing to file?).

I created the header, and when I was typing `bool`, I realized I don't know which C standard my build will use. I need to remember that. 
I need C23 to use bool as a built-in type.
```
#ifndef MAIN_LOGGER_H_
#define MAIN_LOGGER_H_

bool write_log(const char* filename);

#endif
```
and library c file:
```
#include "logger.h"
#include <stdio.h>
#include <stdlib.h>

bool write_log(const char* filename) {
FILE *fptr;
fptr = fopen(filename, "w");

    if (!fptr) {
        return false;
    }
    
    fprintf(fptr, "Hello from Bazel app!");
    fclose(fptr);
    return true;
}
```

Now I need to add the rules for building library to my BUILD file.

```
load("@rules_cc//cc:cc_binary.bzl", "cc_binary")
load("@rules_cc//cc:cc_library.bzl", "cc_library") # Just copied from example

cc_library(
    name = "logger",
    srcs = ["logger.c"],
    hdrs = ["logger.h"],
)

cc_binary(
    name = "app",
    srcs = ["main.c"],
    deps = [
        ":logger",  # Library name
    ],
)

```

I try to compile... aaand... like I thought:

```
In file included from main/logger.c:1:
main/logger.h:4:1: error: unknown type name 'bool'
    4 | bool write_log(const char* filename);
      | ^~~~
main/logger.h:1:1: note: 'bool' is defined in header '<stdbool.h>'; this is probably fixable by adding '#include <stdbool.h>'
```

But I don't want to add a header, I want to switch to C23 standard. Let's use Google.

I added `--copt='-std=c23'` option to compilation command and it worked now. 
```
bazel run //main:app --copt='-std=c23'
WARNING: Build option --copt has changed, discarding analysis cache (this can be expensive, see https://bazel.build/advanced/performance/iteration-speed).
INFO: Analyzed target //main:app (0 packages loaded, 404 targets configured).
INFO: Found 1 target...
Target //main:app up-to-date:
bazel-bin/main/app
INFO: Elapsed time: 0.350s, Critical Path: 0.08s
INFO: 4 processes: 4 action cache hit, 1 internal, 3 processwrapper-sandbox.
INFO: Build completed successfully, 4 total actions
INFO: Running command line: bazel-bin/main/app
Hello world!
```

Ok, it took me around 1hr to play with Bazel and learn the bare minimum to build a tiny C app.
What I am still missing is:
- Is there any project initializer, so I don't need to create files like BUILD, MODULE.bazel, and fill the repetitive lines by hand?
  (I mean like `load("@rules_cc//cc:cc_binary.bzl", "cc_binary")`, `bazel_dep(name = "rules_cc", version = "0.0.17")`)
- Is there a way to fill the C standard into BUILD file instead of command line? (For sure there is).
- Why it's shown in tutorials to use `//` prefixes target name if it works without it?

Ok, it will be it for now. It was not too hard to start without any AI usage. Actually I think it was easier without AI.



## Further reading
[Tools for embedded/bare-metal development using bazel](https://github.com/bazelembedded/bazel-embedded)
[Bazel Build System for Embedded Projects | Interrupt by Memfault](https://interrupt.memfault.com/blog/bazel-build-system-for-embedded-projects)