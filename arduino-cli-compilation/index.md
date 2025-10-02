# Arduino CLI compilation


In previous post we watched what is really happening when we press Verify/Compile via Arduino IDE interface. It turned out plenty of actions happens there,
following the classic compilation scheme (preprocessing, compiling, linking), but adding some Arduino-specifics into this process. From Arduino IDE
the configurations possibilities are very low. This is the price that you have to pay for the simplicity of Arduino IDE. 

# Compiling Arduino sketch via Arduino CLI

Why Arduino CLI when we have IDE?

Why would you switch to Arduino CLI from Arduino IDE? There are many reasons that may play a role for you:
- Configuration is needed, that is unavailable from Arduino IDE,
- Decoupling compilation process from IDE, like for automated compilation,
- Better reproducibility among environments,
- ...

## Installing Arduino CLI

In September 2024 a major Arduino CLI release came out. 
Right now, as for 10.2025, latest version is Arduino CLI 1.3.1. I will use this latest version.
https://blog.arduino.cc/2024/09/05/arduino-cli-1-0-is-out/
I work on Linux.

https://docs.arduino.cc/arduino-cli/installation/

With one-liner on Linux I had CLI installed after 5 seconds.

```angular2html
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
```

Connect board to PC and run
```
arduino-cli core update-index
```

https://docs.arduino.cc/arduino-cli/getting-started/

You can create new sketch with
```
$ arduino-cli sketch new MyFirstSketch
Sketch created in: /home/luca/MyFirstSketch
```

But I want to reuse MyBlink sketch, that I was working on as in previous post.


https://docs.arduino.cc/arduino-cli/
