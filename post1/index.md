# From Sketch to Blink: what really happens inside Arduino IDE


Many beginner embedded developers begin their journey with the Arduino development board. Which is great! Arduino offers beautifully designed and feature-rich boards, with an IDE that’s extremely easy to use.
If you’ve already tried it out, you’ve probably enjoyed the simplicity of Arduino usage: you can just choose a sketch and with two clicks compile it and upload it to the board. No skills needed. But to truly benefit from experimenting on Arduino and later be able to move to more professional setups, it's necessary to understand what is really happening under the hood when you compile and upload your code.

{{< admonition note "Assumed Knowledge" true >}}
I assume you already know how to compile and flash an Arduino board with the Arduino IDE, but haven’t yet dived into the internals of the compilation and flashing process.
{{< /admonition >}}

{{< admonition note "Setup I used" true >}}
- Arduino UNO R4 WiFi board
- Arduino IDE  2.3.6
- Linux Mint

Described things may look different on your PC.
{{< /admonition >}}

## Verbose Compilation Output in Arduino IDE
So, let's start and compile the Blink sketch.

[![Arduino IDE doesn't say much about compilation steps by default](/1.png)](/1.png)

In **Output** window you can observe as compilation of the sketch proceeds. The IDE is not very generous in giving us the information what really has happened. We didn't learn that much, huh? First thing we will change will be the `File->Preferences->Show verbose output` for both compiling and upload.
Let's try again.
<br>


[![Verbose compilation output in Arduino IDE](/2.png)](/2.png)

Now the output is more complete. We now learned about:

- The toolchain is located in 
`~/.arduino15/packages/arduino/tools/arm-none-eabi-gcc/7-2017q4/bin/`

- The compiled file: `~/.cache/arduino/sketches/47AF1217FD2DF7091F869FE16F095863/sketch/Blink.ino.cpp`
- Some of compilation flags used: `-w -Os -g3 -fno-use-cxa-atexit -fno-rtti -fno-exceptions -nostdlib -DF_CPU=48000000 -DNO_USB -DBACKTRACE_SUPPORT -DARDUINO_UNOR4_WIFI -std=gnu++17 -mcpu=cortex-m4 -mfloat-abi=hard -mfpu=fpv4-sp-d16 -fsigned-char -ffunction-sections -fdata-sections`
- Some of linked libraries: `-lstdc++ -lsupc++ -lm -lc -lgcc -lnosys`
- The final ELF is located in `~/.cache/arduino/sketches/49B32143694CE560A1D3954602488E33/Blink.ino.elf`

## Converting MyBlink.ino into MyBlink.ino.cpp file

Let's take a look on the original .ino file and .cpp file that we compiled. The first file, MyBlink.ino is the actual content of what I wrote into Arduino IDE.

```cpp {linenos=table,linenostart=26}
void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(6000);
    digitalWrite(LED_BUILTIN, LOW);
    delay(1000);
}
``` 



In the build folder of my sketch, I find MyBlink.ino.cpp. This is the post-processed .cpp file made from my sketch. (I removed comments for cleariness)
The loop() and init() functions bodies are untouched, but someone addedd <Arduino.h> and weird line macros.
The purpose of these macros is to match your .ino line number, when the compilation message (warning/error) comes from modified MyBlink.ino.cpp file. Without it, you would not be able to 
match the compilation message place to place in your code.

```cpp
#include <Arduino.h>
#line 1 "/home/kate/Arduino/MyBlink/MyBlink.ino"

#line 26 "/home/kate/Arduino/MyBlink/MyBlink.ino"
void setup();
#line 32 "/home/kate/Arduino/MyBlink/MyBlink.ino"
void loop();
#line 26 "/home/kate/Arduino/MyBlink/MyBlink.ino"
void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
    digitalWrite(LED_BUILTIN, HIGH); 
    delay(6000);
    digitalWrite(LED_BUILTIN, LOW);
    delay(1000);
}
```



Using previously compiled file: /home/kate/.cache/arduino/sketches/47AF1217FD2DF7091F869FE16F095863/core/tmp_gen_c_files/pin_data.c.o
Using previously compiled file: /home/kate/.cache/arduino/sketches/47AF1217FD2DF7091F869FE16F095863/core/tmp_gen_c_files/common_data.c.o
Using previously compiled file: /home/kate/.cache/arduino/sketches/47AF1217FD2DF7091F869FE16F095863/core/tmp_gen_c_files/main.c.o
Using previously compiled file: /home/kate/.cache/arduino/sketches/47AF1217FD2DF7091F869FE16F095863/core/variant.cpp.o

Some of std linked libraries are -lstdc++ -lsupc++ -lm -lc -lgcc -lnosys 

The output file is
Blink.ino.hex

We didn't define any main function - let's try to find it! 

## Disassembling output file

As we already learned the toolchain path from the verbose output file, we also know the location of other useful binaries - like objdump
and readelf! As the last step, let's disassemble the final binary of Blink application.


## More reading

https://docs.arduino.cc/arduino-cli/sketch-build-process/ 


