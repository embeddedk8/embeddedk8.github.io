---
title: "Automatic testing for Zephyr applications and libraries with GitHub Actions"
description: "Let's see how we can use simulation and emulation, Twister tool and sanitizers to create nice CI/CD pipeline for Zephyr applications and libraries."
pubDatetime: 2026-04-19T15:58:26+08:00
tags: ["Zephyr", "ci-cd", "testing", "github actions"]
draft: true
slug: 'ci-cd-pipeline-for-zephyr'
---

Zephyr RTOS provides very convenient methods for automatic testing on CI without hardware.
While testing without hardware will never replace the real tests on hardware, it's also the great, cheap and fast way to 
test things that can be tested on emulator or simulator. It also integrated nicely with sanitizers like valgrind, asan, ubsan, and more.

## Own docker, own logic

One and most manual way to run test on Zephyr on CI is to prepare own Docker image with Zephyr installed (and neccessary customizations if any are needed for your usecase),
run the application with west emulation/simulation and process the output manually, and run the tests and process exit code.

The example of how such Docker image can look like is here: [zephyr-ci/Dockerfile](https://github.com/kasia0x01/zephyr-ci-cd/blob/main/zephyr-docker/Dockerfile).

What I want to emphasize is to pay attention to the size of the image. I had to work with very versatile image that was 30GB of size.
It was the base of the runner on CI, so it took the cost of runner time, but additionally I had to use it locally sometimes and I was having hard time with 
space on my device. I see that my example Docker image takes 10GB on disk. Still better than 30GB.

To minimize the image, download only the toolchain you need (here arm-zephyr-eabi):
```bash
ARG ZEPHYR_SDK_VERSION=0.16.8
RUN wget -q \
https://github.com/zephyrproject-rtos/sdk-ng/releases/download/v${ZEPHYR_SDK_VERSION}/zephyr-sdk-${ZEPHYR_SDK_VERSION}_linux-x86_64_minimal.tar.xz \
&& tar xf zephyr-sdk-${ZEPHYR_SDK_VERSION}_linux-x86_64_minimal.tar.xz -C /opt \
&& rm zephyr-sdk-${ZEPHYR_SDK_VERSION}_linux-x86_64_minimal.tar.xz \
&& /opt/zephyr-sdk-${ZEPHYR_SDK_VERSION}/setup.sh -t arm-zephyr-eabi -h -c
```

and checkout only the last commit of the Zephyr repository:
```bash
# Zephyr workspace – shallow narrow fetch to keep image size small
ARG ZEPHYR_VERSION=v3.7.0
RUN west init -m https://github.com/zephyrproject-rtos/zephyr \
        --mr ${ZEPHYR_VERSION} /workspace \
    && cd /workspace \
    && west update -o=--depth=1 -n \
    && pip3 install --no-cache-dir -r /workspace/zephyr/scripts/requirements.txt \
    && west zephyr-export
```
Your future you will be grateful for each 500MB saved.

## Own docker, Twister tool

## Ready Zephyr actions, Twister tool

## This Docker size..!

One option to run Zephyr on CI/CD is to provide custom Docker image to be run. This is what we did, as we needed some customizations.
This Docker size was a pain point. Zephyr SDK and repository are so big. But HOW big your image will be, it depends on how you set it up.

Our Docker was prepared once, and was occupying 30GB on the disk. This size was costing the runners time,
but also we were reusing this image locally (we shared it for CI/CD and for some demos and workshops).
I cannot count the times when I had to remove the image to free up space on my PC, and then build it again when I needed it.
It turnes out the size could have been reduced.

Totally, don't ignore the size of the image even if you think today it doesn't matter that much. You will be thankful for each 500MB od reduction.

### Ready Zephyr actions
If you don't need a custom Docker image, you may just reuse the ready Zephyr GitHub Actions.
Take a look here: [action-zephyr-setup](https://github.com/zephyrproject-rtos/action-zephyr-setup).
It will be the easiest way to get started with Zephyr on GitHub Actions.

## That execution time..!

Second issue was that we had really big amount of tests, and they were taking a lot of time to execute. 
With the naive setup, we were additionally losing time during the execution with manual processing the QEMU output.
With the Twister tool it looks to run and evaluate quicker.

To be able to kill the test execution as soon as possible (i.e. the success string was already printed to console), we
implemented custom test runner, that was able to process stdout during runtime. Additionally, we introduced our custom format of
test cases definitions, that contained board to run on, the successfull or failure string etc. 
And you know what? 

We implemented our own Twister tool as a result. We just didn't hear about Twister at that time (I really believe couple years ago the docs were not that good ^^;).
Anyways -- I can now tell you, that Twister is really offering a lot and you may spare yourself time for reinventing the wheel.

With all that said, I really loved our Zephyr CI/CD pipeline, it survived for years and was extremely useful.

## Some jobs that you can run on CI/CD

### Application run as the test itself

As we built our tests based on some applications, we needed a way to parse the output of the apps and validate if the run is successfull or not.
To save execution time, we had to parse the output on the go, and kill the execution as soon as we see the success or failure string.
This tests runner environment was really useful, but you know what? We just reimplemented the Twister tool without realizing it ^^;.

Twister can not only execute unit tests, but also the application can be run as the test itself. There is no need to reinvent the wheel and create custom tools for that (I know it now).

So let's see how Twister can be used for application validation:

If you take a look on my example application (well, this example could be implemented as the unit test, but let's just say we need to validate if the application prints something 
-- to pretend we're executing something more complex, like integration tests):
```cpp
int main(void)
{
printf("Hello World! %s\n", CONFIG_BOARD_TARGET);

	ring_buf_t rb;
	rb_init(&rb, storage, BUF_CAPACITY);

	for (uint8_t i = 1; i <= 5; i++) {
		rb_push(&rb, i * 10);
	}
	
	uint8_t val;
	size_t popped = 0;
	while (rb_pop(&rb, &val)) {
		printf("  popped: %u\n", val);
		popped++;
	}

	printf("Popped %zu elements\n", popped);

	return 0;
}
```

In application directory we need to place the `testcase.yaml` file, that will define the test case for this application. It should look like this:
```yaml
tests:
  sample.hello_world:
    timeout: 10
    tags: introduction
    platform_allow: qemu_cortex_m3
    harness: console
    harness_config:
      type: one_line
      regex:
        - "Popped 5 elements"
```

Then, by executing Twister, you will treat the application as the testcase, and Twister will run it, analyze the output and provide the tests reports.
```bash
west twister -p qemu_cortex_m3 -T hello_world/  --inline-logs
```

## Executing Unit tests



