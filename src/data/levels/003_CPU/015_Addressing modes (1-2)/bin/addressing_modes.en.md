# CPU: Addressing modes

#### Simple

| Name      | Example       | Input size | Input                     | Output (pseudocode)                   |
| --------- | ------------- | ---------- | ------------------------- | ------------------------------------- |
| Implicit  | `INX`         | `0`        | 🚫                        | 🚫                                    |
| Immediate | `LDA #$08`    | `1`        | 🔢 _final_ **value**      | 🔢                                    |
| Absolute  | `LDA $C002`   | `2`        | 🐏 _full_ **address**     | 🔢/🐏                                 |
| Zero Page | `LDA $15`     | `1`        | 🐏 _partial_ **address**  | 🔢/🐏                                 |
| Relative  | `BNE @label`  | `1`        | 🐏 _relative_ **address** | 🐏 **(\*)**<br/>`toU16([PC]+address)` |
| Indirect  | `JMP ($4080)` | `2`        | 🐏 _indirect_ **address** | 🐏<br/>`read16(address)`              |

#### Indexed

| Name             | Example       | Input size | Input                    | Output (pseudocode)                                                                                                                                                             |
| ---------------- | ------------- | ---------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zero Page,X      | `STA $60,X`   | `1`        | 🐏 _partial_ **address** | 🔢/🐏<br/>`toU8(address+[X])`                                                                                                                                                   |
| Zero Page,Y      | `STA $60,Y`   | `1`        | 🐏 _partial_ **address** | 🔢/🐏<br/>`toU8(address+[Y])`                                                                                                                                                   |
| Absolute,X       | `STA $4050,X` | `2`        | 🐏 _full_ **address**    | 🔢/🐏 **(\*)**<br/>`toU16(address+[X])`                                                                                                                                         |
| Absolute,Y       | `STA $4050,Y` | `2`        | 🐏 _full_ **address**    | 🔢/🐏 **(\*)**<br/>`toU16(address+[Y])`                                                                                                                                         |
| Indexed Indirect | `STA ($01,X)` | `1`        | 🐏 _partial_ **address** | 🔢/🐏<br/><br/>`const start = toU8(address+[X]);`<br/>`const end = toU8(start+1);`<br/><br/>`buildU16(read(end), read(start))`                                                  |
| Indirect Indexed | `LDA ($03),Y` | `1`        | 🐏 _partial_ **address** | 🔢/🐏 **(\*)**<br/><br/>`const start = address;`<br/>`const end = toU8(start+1);`<br/>`const baseAddress = buildU16(read(end), read(start));`<br/><br/>`toU16(baseAddress+[Y])` |

<hr>

**(\*)** These addressing modes define the _output_ as the sum of a _base address_ and an offset, adding `N` extra cycles (`cpu.extraCycles += N`) if they cross pages. That is, when the _base address_ and _output_ differ in their most significant byte.

- In the **Relative** mode, `N` = 2
- In the **indexed** modes, `N` = 1

⚠️ Not all opcodes have this cross-page penalty, so the addressing modes receive a `hasPageCrossPenalty` boolean that indicates whether this extra cycles should be added.
