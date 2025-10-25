# Proces budowania w Arduino IDE (ze szczegółami!)


Wielu początkujących programistów systemów wbudowanych zaczyna od Arduino. Jest to całkiem dobry pomysł, gdyż żadne
inne środowisko embedded nie jest aż tak łatwe w obsłudze! 

Instalacja Arduino IDE przebiega raczej bezproblemowo, a potem wystarczy połączyć płytkę po USB, i jednym kliknięciem zbudować program,
a drugim załadować go na płytkę. Choć brzmi jak błogosławieństwo, to nadmierna prostota potrafi być też przeszkodą w nauce —
no bo skoro wszystko działa samo z siebie, to po co zagłębiać się w jakieś nadmierne szczegóły? Kopiujemy kod z chatGPT i jazda! 

O nonono! No własnie, tak dobrze to nie ma. Czego się w ten sposób nauczysz? Trzeba się trochę pomęczyć i pogrzebać, nawet kiedy wydaje się,
że nie ma po co. Dlatego właśnie napisałam tego posta — popatrzymy razem, co dokładnie dzieje się, kiedy Arduino IDE buduje nasz program
(*jak powiedzieć po polsku sketch?!*).

{{< admonition note "Co zakładam, że wiesz" true >}}
Zakładam, że masz zainstalowane środowisko Arduino IDE, umiesz skompilować program i wgrać go na płytkę, ale nie znasz szczegółów dotyczących 
procesu kompilacji i flashowania.
{{< /admonition >}}

{{< admonition note "Czego użyłam" true >}}
- płytka Arduino UNO R4 WiFi
- płytka Arduino IDE  2.3.6
- Linux Mint

Jeśli masz inną płytkę, inną wersję IDE czy inny system operacyjny, to wizualnie wszystko u Ciebie może wyglądać inaczej, ale 
pod spodem **powinno** być z grubsza to samo! 
{{< /admonition >}}

## Czego się nauczysz?
Po przeczytaniu tego artykułu,
- będziesz rozumiał standardowy proces budowania aplikacji na systemy wbudowane,
- dowiesz się, jakie dodatkowe operacje wykonuje środowisko Arduino,
- będziesz też wiedział, gdzie leżą te wszystkie pliki, artefakty i cache.

## Zaczynamy!
Zbudujemy razem *sketch* i przejdziemy krok po kroku przez proces budowania go.
Mogę udawać razem z Tobą, że nie mam pojęcia co się tam dzieje. Nasze obserwacje
będziemy opierać na logach z okienka **Build Output**.

### Budujemy przykładowy program
Otwórz Arduino IDE i wybierz swoją płytkę w menu **Select Board**. Ja mam **Arduino UNO R4 WiFi**.

Załaduj przykładowy program Blink i zapisz w swoim sketchbooku.
Teraz naciśnij **Verify/Compile**. Program zaczyna się budować, a w okienku **Output** pojawiają się logi.

Udało się! Program zbudował się poprawnie. Teraz już można wgrać go na płytkę.
Tylko... mieliśmy się uczyć z **Build Outputu**, a tam są tylko dwie linijki. Nie pouczymy się za wiele.

Na szczęście ten problem jest łatwo rozwiązać.

[![Arduino IDE przy domyślnych ustawieniach ukrywa większość logów](/arduino-ide-default-output.png "Arduino IDE - domyślny Build Output")](/arduino-ide-default-output.png)

### Włączamy szczegółowe logi
Jeśli chcemy się dowiedzieć więcej na temat procesu budowania z logów z IDE, musimy 
włączyć opcję **verbose output**, dzięki której okienko **Build Output** będzie zawierało dużo więcej informacji.
Żeby to włączyć, wejdź w **File-> Preferences** i zaznacz **Show verbose output** dla kompilowania i uploadowania.

Teraz, gdy ponownie uruchomisz budowanie, Arduino IDE nie będzie obcinało logów.
No to teraz je przeanalizujmy!
<br>

[![Verbose compilation output in Arduino IDE](/arduino-ide-verbose-output.png "Arduino IDE - verbose build output")](/arduino-ide-verbose-output.png)


## Identyfikacja płytki

W programowaniu systemów wbudowanych, proces kompilacji zawsze jest zależny od targetu, na który chcemy wgrać program.
Każda płytka ma swoją architekturę, a każda architektura wymaga, by do budowania używać dedykowanego dla niej toolchaina.
Właśnie dlatego zanim jeszcze zacznie się proces budowania, Arduino musi wiedzieć na jaką płytkę ma to być budowane
— a wiedzą to stąd, że wybrałeś właściwą płytkę z menu **Select Board**.

Do identyfikacji płytki Arduino używa formatu **FQBN (Fully Qualified Board Name)**, który wygląda tak:

```bash
FQBN: arduino:renesas_uno:unor4wifi
```
**FQBN** jest unikalny dla każdej płytki i składa się z trzech segmentów:
- Vendor: `arduino` (*to oficjalna płytka wyprodukowana przez Arduino*)
- Architecture: `renesas_uno` (*rodzina płytek opartych na układach Renesas*)
- Board: `unor4wifi` (*dokładny model płytki: Arduino Uno R4 WiFi*).

Jeśli wybrałbyś niewłaściwą płytkę, to albo program Ci się w ogóle nie skompiluje, albo nie będzie działało po wgraniu.

{{< admonition tip >}}
Błąd `Compilation error: Missing FQBN (Fully Qualified Board Name)` znaczy, że nie ustawiłeś swojej płytki w menu.
{{</ admonition>}}

## Foldery w środowisku Arduino
Na pewno warto wiedzieć, gdzie na dysku są artefakty budowania, a gdzie paczki i biblioteki, dostarczane 
przez Arduino, używane do kompilacji. Nie jest to takie oczywiste, bo te rzeczy są w ukrytych folderach,
ale ich lokalizacja jest wypisywana w logach podczas kompilacji. Popatrzmy.

### Folder Arduino15
Folder **Arduino15** zawiera ustawienia użytkownika, zainstalowane paczki i biblioteki do konkretnych płytek.
Lokalizacja tego folderu zależy od Twojego [systemu operacyjnego](https://support.arduino.cc/hc/en-us/articles/360018448279-Open-the-Arduino15-folder).

Pliki (implementacja API, biblioteki) powiązane z konkretną rodziną płytek leżą w folderze Arduino15, 
pod ścieżką która pokazała nam się w logach kompilacji, na przykład u mnie to jest:
```
Using board 'unor4wifi' from platform in folder: /home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.4.1
Using core 'arduino' from platform in folder: /home/kate/.arduino15/packages/arduino/hardware/renesas_uno/1.4.1
```

Jednym z ciekawych plików w tym folderze jest [boards.txt](https://arduino.github.io/arduino-cli/1.3/platform-specification/#boardstxt),
który wypisuje wszystkie płytki wspierane przez platformę. Każda płytka skonfigurowana jest w swojej sekcji,
jako pary kluczy i wartości definiujące jak na tę płytkę się kompiluje, jak wgrywa program czy debuguje.

Moja płytka **Arduino UNO R4 WiFi** skonfigurowana jest tak:

```
##############################################################

unor4wifi.name=Arduino UNO R4 WiFi
unor4wifi.build.core=arduino
unor4wifi.build.crossprefix=arm-none-eabi-
unor4wifi.build.compiler_path={runtime.tools.arm-none-eabi-gcc-7-2017q4.path}/bin/

unor4wifi.build.variant=UNOWIFIR4
unor4wifi.build.mcu=cortex-m4
unor4wifi.build.architecture=cortex-m4
unor4wifi.build.fpu=-mfpu=fpv4-sp-d16
unor4wifi.build.float-abi=-mfloat-abi=hard

unor4wifi.upload.tool=bossac
...
```

Dzięki tym ustawieniom my — deweloperzy — nie musimy konfigurować nic ponadto, że wybraliśmy 
właściwą płytkę z menu **Select Board**.

**Toolchain**

W folderze **Arduino15** znajduje się też toolchain:`.arduino15/packages/arduino/tools/arm-none-eabi-gcc/7-2017q4/bin/`.
Poza kompilatorem, są tam też inne przydatne narzedzia, np. `objdump`, którego można użyć do analizowania zbudowanych binarek.

{{< admonition type=tip title="A może chciałbyś przenieść folder Arduino15 w inne miejsce?" open=true  >}}
W niektórych przypadkach możesz chcieć przenieść folder Arduino15 w inne miejsce na dysku —
na przykład, gdy na głównym dysku kończy Ci się miejsce. Możesz to zrobić:

1. Skopiuj folder Arduino15 do nowej lokalizacji,

2. Otwórz plik `~/.arduinoIDE/arduino-cli.yaml` i zmodyfikuj ścieżkę `directories: data`, np.:

```
board_manager:
    additional_urls: []
directories:
    data: /home/kate/new-location-arduino15
```

3. Uruchom ponownie Arduino IDE. Powinno już używać nowej lokalizacji **Arduino15**. 
Sprawdź w logach budowania, czy zmiana się powiodła.

4. Jak potwierdzisz, że Arduino IDE używa już przeniesionego folderu, to oryginalny folder **Arduino15** możesz usunąć.
   {{< /admonition >}}

### Arduino core
**Arduino code** to kolejny ważny folder w środowisku Arduino. Zawiera on implementację funkcji używanych przez
Arduino, na dany target. Znajdziesz go w podfolderze `cores`:
```
.arduino15/packages/arduino/hardware/renesas_uno/1.4.1/cores/
```
Każda rodzina płytek, albo płytka, będzie miała swój własny `core`, dopasowany do jej hardware.

Wewnątrz **Arduino core** znajdziemy między innymi:
- `main.cpp` — tutaj zdefiniowany jest kod, który wykonuje się jeszcze przed wywołaniem Twojego `setup()` 
    i woła w pętli Twoją funkcję `loop()`,
- `Arduino.h` — header używany przez wszystkie programy na Arduino,
- implementacja obsługi przerwań, komunikacji UART, czasu (funkcje jak `delay`), i wiele innych niskopoziomowych funkcji.

Rzuć teraz okiem na `main.cpp` i zapoznaj się z całą otoczką, którą Arduino wrzuca do Twoich programów.

### Folder budowania 
When you compile a sketch, the build artifacts (i.e. intermediate object files) are not stored
in the same directory as your source code. It would make a mess inside your sketch folder,
or even made conflicts when building the same sketch for different boards.

That's why build files are always stored in separate build directory.

In case of Arduino IDE, the build directory is a per-sketch cache, created in a hidden folder.

You can find the path to this build directory in the build log. My sketch was built here:

``` 
/home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/sketch/`.
```
If you open this folder, you’ll see the build artifacts, including:
- object files (`.o`),
- preprocessed sources (`.cpp`),
- final binaries (`.bin`, `.hex`, `.elf`).


{{< admonition tip `Exporting Compiled Binary`>}}
If you want to have the compiled binaries in your sketch folder, click **Sketch → Export Compiled Binary** option from Arduino IDE menu.
This will build your sketch and place a copy of the `.hex`, `.bin`, `.elf` and `.map` inside the sketch sources
folder so it’s easy to find later.
{{</ admonition >}}

We already discussed board identification and the Arduino specific directories. Let's move to actual build process.

## General embedded software build process
At a high level, the Arduino build process is essentially a C++ build process adapted
for embedded targets, and with some Arduino specific features. The general C/C++ build pipeline is presented below:
[![General C/C++ build process](/general-c-build-process.png "General C/C++ build process")](/general-c-build-process.png)

## Preprocessing
The first phase of every C/C++ program build is preprocessing.
In general, preprocessor expands macros like `#include`, `#define`, and conditional compilation (`#if`, `#ifdef`, etc.).
The output is a single expanded source file.
In Arduino, some additional steps are added around preprocessing stage.

### Concatenating .ino files
If the sketch contains of multiple `.ino` files, they are first concatenated into a single `.cpp` file.

### Detecting libraries used
Arduino uses a special build recipe (`recipe.preproc.macros` [[1]](https://docs.arduino.cc/arduino-cli/platform-specification/))
to detect which libraries are required by your sketch.
During this step, the preprocessor scans the sketch for `#include`s that reference library header files.
If a matching header is found, the corresponding library is automatically marked as needed and included in the build process.

```
Detecting libraries used...
/home/kate/.arduino15/packages/arduino/tools/arm-none-eabi-gcc/7-2017q4/bin/arm-none-eabi-g++ (...) -E \
/home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/sketch/MyBlink.ino.cpp -o /dev/null
```

As we see in build output, the compiler is invoked with the `-E` flag, which tells it to stop after the preprocessing
stage and not produce any compiled output.

For a simple sketch like Blink, this stage isn't very exciting: it doesn't detect in any additional libraries.
That's why the build output doesn't show anything under *Detecting libraries used...*.
Open other example sketches, such as those from **WiFiS3** or **EEPROM**, and you'll see how more complex projects trigger detection of multiple libraries.

**Why does Arduino detect libraries automatically?**

The Arduino IDE compiles only the libraries that your sketch actually needs — no manual setup required.
In most other development environments, this step is up to the developer: you have to configure which libraries or dependencies should be included in the build.
Arduino takes care of this automatically, keeping things simple and beginner-friendly.

### Generating function prototypes
The next stage in the build process is automatic function prototype generation. In C or C++, each function must be
either defined or declared before it's called. In Arduino, you don't need to worry about that — you can write functions
in any order, without adding their prototypes. How does it work? Arduino generates these prototypes for you!

Here’s what the build log shows:
```
Generating function prototypes...
arm-none-eabi-g++ (...) -E /home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/sketch/MyBlink.ino.cpp -o /tmp/1121713208/sketch_merged.cpp
ctags (...) /tmp/1121713208/sketch_merged.cpp
```
Again, the compiler is invoked with the `-E` flag, meaning only the preprocessor runs.
This is what happens now:

1. **Preprocessing**

   The `MyBlink.ino.cpp` (file concatenated of all `.ino` files) is input for the preprocessor: `#include`s are expanded and macros replaces.
   The expanded file is stored as `/tmp/1121713208/sketch_merged.cpp`.

2. **Scanning functions**

   Tool `ctags` is running over expanded `sketch_merged.cpp`, to extract function symbols.

3. **Generating prototypes**

   Based on the `ctags` result, Arduino environment inserts forward declarations for you. This way, you don't need to worry
   about undeclared functions, functions order, etc.

5. **Store prototypes into .ino.cpp**

   The resulting version is stored into `MyBlink.ino.cpp`. This is what the compiler will actually use later on.


Your simple sketch (`MyBlink.ino`):

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

gets transformed into (`MyBlink.ino.cpp`):
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

To summarize differences:
- `#include <Arduino.h>` is added,
- `#line` macros are added — they keep compiler error messages pointing to the right lines in your `.ino` file.
  Without them, errors would show up with the line numbers of the generated `.cpp`, which would be super confusing.
- function prototypes are added.

## Compilation
Here’s where your code finally turns into machine instructions that the microcontroller can execute.

### Sketch compilation
During this step, the compiler checks your code for syntax errors and converts it
into the object code that can be linked with libraries later.

```
Compiling sketch...
arm-none-eabi-g++ (...) -c sketch/MyBlink.ino.cpp -o sketch/MyBlink.ino.cpp.o
```

Compiler is invoked with `-c` flag, which means compile only (and don’t link yet).

**Input:** `MyBlink.ino.cpp` - the auto-generated sketch with prototypes, includes, and line directives.

**Output:** `MyBlink.ino.cpp.o` - machine-code object file, ready to be linked later.

I shortened the compilation command, so it's not in the snippet above, but in IDE we can observe a lots of compilation flags that were used.
Some highlights:
- `-Os` → optimize for size.
- `-g3` → include debug info at max level.
- `-fno-rtti`, `-fno-exceptions` → strip C++ runtime features to save space.
- `-nostdlib` → don’t link against standard system libraries [[1]](https://gcc.gnu.org/onlinedocs/gcc/Link-Options.html).
- `-mcpu=cortex-m4 -mthumb -mfloat-abi=hard -mfpu=fpv4-sp-d16` → target an ARM Cortex-M4 with hardware floating point.
- `-I` and `@.../includes.txt` → add search paths for Arduino core and variant headers.
- Many `-D...` → defines for board, CPU frequency, Arduino version, etc.

{{< admonition >}}
Most advanced IDEs let you change compiler settings like optimization level, debug info, or extra flags right from a project menu.  
Arduino IDE is so simple that it doesn't offer this option: you don’t get a button or menu for that.

If you want to change some settings, you’ve got several ways:

- **Edit build recipes**: you can change files like `platform.txt` or `boards.local.txt` to change or add your own compilation flags,
- **modify `arduino-cli.yaml`** from **ArduinoIDE** folder,
- **use Arduino CLI** directly: the command-line tool gives you more flexibility and can build your sketch with whatever options you like.

{{</ admonition >}}

At this point, your sketch has been turned into machine code, stored in `MyBlink.ino.cpp.o`.
This file contains your `setup()` and `loop()` code, ready to be linked with the Arduino core and libraries in the next step.

### Compiling libraries
```cpp
Compiling libraries...
```
For the Blink sketch this step is empty. In the previous phase (*Detecting libraries used*) no additional libraries were found.
Blink only relies on core Arduino functions such as `pinMode`, `digitalWrite`, and `delay`, which are part of the board core, not separate libraries.

In more advanced sketches the output looks different.
For example, in **WiFiS3/ConnectWithWPA** the **WiFiS3** library is detected and its source files are compiled here.

### Compiling core

```bash
Compiling core...
Using previously compiled file: /home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/core/tmp_gen_c_files/pin_data.c.o
Using previously compiled file: /home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/core/tmp_gen_c_files/main.c.o
Using previously compiled file: /home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/core/tmp_gen_c_files/common_data.c.o
Using previously compiled file: /home/kate/.cache/arduino/sketches/D7CC1D7CA645BCFE67207C07A05B3A2A/core/variant.cpp.o
Using precompiled core: /home/kate/.cache/arduino/cores/arduino_renesas_uno_unor4wifi_4e1bf6711f2b98688d9a4a386931d6dc/core.a
```

The core is the foundation of every Arduino program.
We disussed in in [Arduino core](#arduino-core) chapter. Instead of recompiling the same core files every time you build,
the Arduino IDE uses precompiled objects from a cache. It speeds up the compilation.

## Linking everything together

Once all the individual files are compiled, the Arduino build system needs to link them into a single program.
I shortened the link command to present only the most important stuff:

```bash
arm-none-eabi-g++ \
  -mcpu=cortex-m4 -mfloat-abi=hard -mfpu=fpv4-sp-d16 \
  -o MyBlink.ino.elf \
  MyBlink.ino.cpp.o common_data.c.o main.c.o pin_data.c.o variant.cpp.o \
  libfsp.a core.a \
  -lstdc++ -lsupc++ -lm -lc -lgcc -lnosys
```

After this step, the final binary will be `MyBlink.ino.elf`.

Please note which libraries are linked into the build:
- `libfsp.a` → the Renesas Flexible Software Package, providing hardware drivers and low-level functions for peripherals.
- `core.a` → the Arduino core for this board.
  Libraries above are board support libraries. These are part of the Arduino board package (for the Uno R4 in this case).
  They are not optional user libraries, so they don’t appear in the detection phase.

Toolchain standard libraries:
- `-lstdc++` → the C++ standard library,
- `-lsupc++` → low-level C++ runtime support,
- `-lm` → the math library,
- `-lc` → the standard C library,
- `-lgcc` → helper routines from GCC itself,
- `-lnosys` → stubs for system calls.

## Finalizing build
### Creating binary and hex files

After the ELF file (`MyBlink.ino.elf`) is created, the build system uses `objcopy` to generate `hex` and `bin` formats:

```bash
arm-none-eabi-objcopy -O binary -j .text -j .data MyBlink.ino.elf MyBlink.ino.bin
arm-none-eabi-objcopy -O ihex   -j .text -j .data MyBlink.ino.elf MyBlink.ino.hex
```
Both formats contain the same program, just encoded differently for different flashing tools.

### Measuring the program size
Finally, the build system reports memory usage with `arm-none-eabi-size`:

```bash
arm-none-eabi-size -A MyBlink.ino.elf
```

### Cleaning the build
Unfortunately, Arduino IDE does not offer the `Clean build` or `Force rebuild` option ([[1]](https://forum.arduino.cc/t/feature-request-clean-build-option/1291789),
[[2]](https://forum.arduino.cc/t/can-i-force-the-arduino-ide-to-recompile-everything/866547),
[[3]](https://github.com/arduino/arduino-ide/issues/419)). The workaround for it is to manually delete the cached build directories we mentioned earlier.


## More reading

1. [Build Sketch Process from docs.arduino.cc](https://docs.arduino.cc/arduino-cli/sketch-build-process/)
2. [Find sketches, libraries, board cores and other files on your computer from support.arduino.cc](https://support.arduino.cc/hc/en-us/articles/4415103213714-Find-sketches-libraries-board-cores-and-other-files-on-your-computer)
3. [ARM Reverse Engineering Notes: Compilation](https://github.com/microbuilder/armreveng/blob/main/compilation.md)
4. [Open issues in arduino-cli related to build process](https://github.com/arduino/arduino-cli/issues?q=state%3Aopen%20label%3A%22topic%3A%20build-process%22)
5. [De-Mystifying Libraries - How Arduino IDE Finds and Uses Your Files - OhioIoT](https://www.youtube.com/watch?v=7vLjK9t-uZY)



