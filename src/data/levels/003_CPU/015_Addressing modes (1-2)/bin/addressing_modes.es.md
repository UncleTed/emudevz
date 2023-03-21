# CPU: Modos de direccionamiento

#### Simples

| Nombre    | Ejemplo       | Tamaño de entrada | Entrada                      | Salida (pseudocódigo)                  |
| --------- | ------------- | ----------------- | ---------------------------- | -------------------------------------- |
| Implicit  | `INX`         | `0`               | 🚫                           | 🚫                                     |
| Immediate | `LDA #$08`    | `1`               | 🔢 **valor** _final_         | 🔢                                     |
| Absolute  | `LDA $C002`   | `2`               | 🐏 **dirección** _completa_  | 🔢/🐏                                  |
| Zero Page | `LDA $15`     | `1`               | 🐏 **dirección** _parcial_   | 🔢/🐏                                  |
| Relative  | `BNE @label`  | `1`               | 🐏 **dirección** _relativa_  | 🐏 **(\*1)**<br/>`toU16([PC]+address)` |
| Indirect  | `JMP ($4080)` | `2`               | 🐏 **dirección** _indirecta_ | 🐏 **(\*2)**<br/>`read16(address)`     |

#### Indexados

| Nombre           | Ejemplo       | Tamaño de entrada | Entrada                     | Salida (pseudocódigo)                                                                                                                                                           |
| ---------------- | ------------- | ----------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zero Page,X      | `STA $60,X`   | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏<br/>`toU8(address+[X])`                                                                                                                                                   |
| Zero Page,Y      | `STA $60,Y`   | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏<br/>`toU8(address+[Y])`                                                                                                                                                   |
| Absolute,X       | `STA $4050,X` | `2`               | 🐏 **dirección** _completa_ | 🔢/🐏 **(\*)**<br/>`toU16(address+[X])`                                                                                                                                         |
| Absolute,Y       | `STA $4050,Y` | `2`               | 🐏 **dirección** _completa_ | 🔢/🐏 **(\*)**<br/>`toU16(address+[Y])`                                                                                                                                         |
| Indexed Indirect | `STA ($01,X)` | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏<br/><br/>`const start = toU8(address+[X]);`<br/>`const end = toU8(start+1);`<br/><br/>`buildU16(read(end), read(start))`                                                  |
| Indirect Indexed | `LDA ($03),Y` | `1`               | 🐏 **dirección** _parcial_  | 🔢/🐏 **(\*)**<br/><br/>`const start = address;`<br/>`const end = toU8(start+1);`<br/>`const baseAddress = buildU16(read(end), read(start));`<br/><br/>`toU16(baseAddress+[Y])` |

<hr>

**(\*)** Estos modos de direccionamiento definen la _salida_ como la suma de una _dirección base_ y un desplazamiento, agregando `N` ciclos extra (`cpu.extraCycles += N`) si cruzan páginas. Esto es, cuando la _dirección base_ y la _salida_ difieren en su byte más significativo.

- En el modo **Relative**, `N` = 2
- En los modos **indexados**, `N` = 1

⚠️ No todos los opcodes tienen esta penalidad al cruzar de página, por lo que los modos de direccionamiento reciben un booleano `hasPageCrossPenalty` que indica si los ciclos extra deberían ser agregados.
