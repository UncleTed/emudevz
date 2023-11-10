# PPU: Renderizado de fondos

- Una 🏞️📖 _name table_ es una matriz de `32x30` 🕊️ _índices de tile_.
- Dado que la resolución de pantalla es `256x240`, y cada 🕊️ _tile_ es de `8x8` pixeles, estos `32x30` _tiles_ cubren toda el área de la pantalla ✨.
- Cada 🕊️ _índice de tile_ ocupa `1` byte, y hay `64` bytes de 🖍️ _metadatos de color_ al final de la _name table_.
- Por lo tanto, cada _name table_ da un total de `1024` bytes (`32*30*1 + 64`).
- La 🐏 `VRAM` contiene `2` 🏞️📖 _name tables_.
  - (eso está disponible en direcciones PPU `$2000-$27FF`)

<div class="embed-image"><img alt="Name table memory" src="assets/graphics/name_tables.png" style="width: 100%" /></div>

#### Ejemplo de name table

<div class="embed-image"><img alt="Name table" src="assets/graphics/nametable_debug.png" style="width: 75%" /></div>

#### Renderizado

##### ⬛️⬜️ Escala de grises

- Encuentra la ubicación de la 🏞️📖 _name table_:
  - Los primeros `2` bits de 🎛️ `PPUCtrl` contienen el `nameTableId`.
  - La tabla estará en la dirección PPU `0x2000 + nameTableId * 1024`.
- Cada uno de los siguientes `960` bytes será un 🕊️ _tile index_ (`0-255`).
  - Ignora por ahora los 🖍️ _metadatos de color_.
- En el ciclo `256` de cada scanline visible (`0-239`), dibuja una fila de pixeles (compuesta por `32` tiles cada una).
  - Usa una 🎨 _paleta_ fija:
    - `[0xffffffff, 0xffcecece, 0xff686868, 0xff000000]`.

##### 🎨🌈 Agregando color

###### **Obtención de ids de paletas**

- Cada sección de `"metadata de color"` es una 🖍️📖 _attribute table_ que define qué 🎨 _paleta_ debe usar cada _tile_.
- Las 🎨 paletas tienen `4` colores y se asignan a `bloques` de `2x2` _tiles_.

<div class="embed-image"><img alt="Palette blocks" src="assets/graphics/palette-blocks.gif" style="width: 75%" /></div>

- La cuadrícula roja ilustra los `bloques` de paleta. Observa cómo todos los _tiles_ de cada bloque de `2x2` comparten la misma paleta.
- Para codificar estos datos, la pantalla se divide primero en `metabloques` de `4x4` _tiles_.

<div class="embed-image"><img alt="Palette metablocks" src="assets/graphics/palette-metablocks.gif" style="width: 75%" /></div>

- La cuadrícula verde representa `metabloques`. Hay `64` de ellos, `1` byte por `metabloque`.
- Cada byte contiene:
  - Bits `0,1`: 🎨 _id de paleta_ del `bloque 0` (arriba a la izquierda).
  - Bits `2,3`: 🎨 _id de paleta_ del `bloque 1` (arriba a la derecha).
  - Bits `4,5`: 🎨 _id de paleta_ del `bloque 2` (abajo a la izquierda).
  - Bits `6,7`: 🎨 _id de paleta_ del `bloque 3` (abajo a la derecha).

###### **Lectura de datos de paleta**

- Una 🎨 _paleta_ es un arreglo de `4` 🖍️ _índices de color_ (`0-63`), apuntando a la 👑🎨 _paleta maestra_ hardcodeada.
- Cada 🖍️ _índice de color_ ocupa `1` byte, por lo que cada 🎨 _paleta_ suma `4` bytes.
- La 🐏 `Palette RAM` contiene `4` paletas para fondos y `4` paletas para sprites.
  - (las paletas de fondo están disponibles en las direcciones PPU `$3F00-$3F0F`)

<div class="embed-image"><img alt="Palette RAM" src="assets/graphics/palette_ram.png" style="width: 100%" /></div>
