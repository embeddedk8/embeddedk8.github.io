# Arduino UNO R4 WiFi + Arduino IoT Cloud: setup and firmware fix on Linux

Getting your Arduino UNO R4 WiFi connected to Arduino IoT Cloud can be tricky on Linux. I describe the issue I encountered and how I fixed it.

<!--more-->

## Adding Arduino Uno R4 WiFi to Arduino Cloud
I wanted to start developing some IoT applications on my Arduino Uno R4 WiFi, so I created a free account at https://cloud.arduino.cc/
. Very soon, it turned out that some things don’t work well on Linux — or at least not on my distro (Linux Mint 20.3).

In Arduino Cloud, I tried to create a new Thing and add a new Associated Device. 
My Arduino Uno R4 WiFi was connected via USB and recognized automatically. 
Arduino Cloud asked me to install Arduino Cloud Agent, and that installation was successful.

## ... and the issues on Linux Mint
The issues started later: Arduino Cloud claimed that I needed to upgrade the connectivity firmware on my board. 
I tried to start the firmware upgrade several times — each time it failed with the following error:
```
2025-10-20T16:13:23.709Z fwuploader ERROR Error: Error executing /home/kate/arduino-ide_2.3.6_Linux_64bit/resources/app/lib/backend/resources/arduino-fwuploader firmware flash --fqbn arduino:renesas_uno:unor4wifi --address /dev/ttyACM0 --module ESP32-S3@0.6.0: [2025-10-20T16:13:15Z INFO ] 🚀 A new version of espflash is available: v4.2.0
[2025-10-20T16:13:15Z INFO ] Serial port: '/dev/ttyACM0'
[2025-10-20T16:13:15Z INFO ] Connecting...
[2025-10-20T16:13:15Z INFO ] Unable to connect, retrying with extra delay...
[2025-10-20T16:13:15Z INFO ] Unable to connect, retrying with default delay...
[2025-10-20T16:13:15Z INFO ] Unable to connect, retrying with extra delay...
[2025-10-20T16:13:15Z INFO ] Unable to connect, retrying with default delay...
[2025-10-20T16:13:15Z INFO ] Unable to connect, retrying with extra delay...
[2025-10-20T16:13:15Z INFO ] Unable to connect, retrying with default delay...
[2025-10-20T16:13:15Z INFO ] Unable to connect, retrying with extra delay...
Error: espflash::connection_failed

× Error while connecting to device
╰─▶ Failed to connect to the device
help: Ensure that the device is connected and the reset and boot pins are
not being held down
```

What’s worse, after several attempts, the board seemed to be bricked. 
I unplugged and plugged it back several times, but it didn’t help. I couldn’t flash any sketches anymore (I admit I panicked).

I found some topic relating to similar issues, like [this](https://forum.arduino.cc/t/arduino-create-agent-uno-r4-wifi-unable-to-update-firmware/1233222).

The posts were mentioning several fixes:
- upgrade the firmware via **Firmware Updater** from Arduino IDE like described [here](https://support.arduino.cc/hc/en-us/articles/9670986058780-Update-the-connectivity-module-firmware-on-UNO-R4-WiFi). Failing,
- modification of above: start with upgrading to lower version like `0.2.1`, then upgrade gradually. Failing,
- using shorter, better USB cable — no success,
- restore USB connectivity via manual `espflash` ([here](https://support.arduino.cc/hc/en-us/articles/16379769332892-Restore-the-USB-connectivity-firmware-on-UNO-R4-WiFi-with-espflash)) — I had incompatible GLIBC version error.

Everything was failing! Luckily, when I plugged Arduino board again, after some longer time,
it suddenly became discoverable. But following retries to upgrade the firmware to be able to add it to Arduino Cloud were still failing.

## Windows fixed the issue
As a last resort, I borrowed a PC with Windows and tried again. And (not surprisingly), 
the Cloud web process to upgrade the firmware went smoothly. 
It seems the firmware upgrade just doesn’t work properly on Linux — or maybe specifically on Linux Mint — 
since I saw other posts mentioning the same issue on Linux Mint.

After upgrading the firmware from Windows, I went back to my Linux machine and flashed the board with the default 
sketch created on Arduino Cloud. Now my board is online, and I’m able to flash sketches from my Linux system again.

If you’re on Linux and get repeated firmware upgrade failures, 
it might save time to perform the upgrade from a Windows machine once, 
then return to Linux for normal development.

To be fair on Arduino, I think my operating system may need an upgrade.


