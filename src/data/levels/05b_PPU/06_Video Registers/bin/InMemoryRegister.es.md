# `InMemoryRegister`

📄 /lib/InMemoryRegister.js 📄

Esta clase facilita la implementación de registros mapeados en memoria usados por el hardware de la NEEES.

## Uso

1. Crea una clase para cada registro mapeado en memoria. Para crear un registro PPU, extiende de `InMemoryRegister.PPU`. Para un registro APU, extiende de `InMemoryRegister.APU`.
2. En el método `onLoad()`, usa `addField(...)`/`addWritableField(...)` para definir _campos_ que residen en los bits del registro (ver ejemplo abajo).
3. Si el registro puede ser leído por la CPU 🧠, implementa `onRead()`. De lo contrario, las lecturas devolverán `0`.
4. Si el registro puede ser escrito por la CPU 🧠, implementa `onWrite(value)`. De lo contrario, las escrituras no tendrán efecto.

### Ejemplos

Los ejemplos se basan en los registros PPU 🖥️, pero **los registros APU 🔊 funcionan de la misma manera**.

#### ✏️ Solo escritura

Los registros de solo escritura son llenados por los juegos mediante escrituras en memoria ejecutadas por la CPU 🧠. Al escribir en su dirección de memoria, los juegos establecen un valor que la PPU 🖥️ puede consultar luego para realizar diferentes acciones, como cambiar el tamaño de los sprites. Algunas escrituras también pueden desencadenar otros efectos inmediatos.

```javascript
import InMemoryRegister from "/lib/InMemoryRegister";

class PPUCtrl extends InMemoryRegister.PPU {
  onLoad() {
    this.addField("nameTableId", 0, 2) //         bits 0-1
      .addField("vramAddressIncrement32", 2) //   bit 2
      .addField("sprite8x8PatternTableId", 3) //  bit 3
      .addField("backgroundPatternTableId", 4) // bit 4
      .addField("spriteSize", 5) //               bit 5
      .addField("generateNMIOnVBlank", 7); //     bit 7
  }

  // cuando onRead() no está definido, las lecturas retornan 0

  onWrite(value) {
    this.setValue(value); // esto actualiza `this.value` y todos los campos

    // aquí puedes desencadenar otras operaciones con `this.ppu`
  }
}

const ppuCtrl = new PPUCtrl(ppu);
ppuCtrl.onWrite(0b10010010);

ppuCtrl.onRead(); //                 => 0
ppuCtrl.value; //                    => 146
ppuCtrl.nameTableId; //              => 2
ppuCtrl.vramAddressIncrement32; //   => 0
ppuCtrl.sprite8x8PatternTableId; //  => 0
ppuCtrl.backgroundPatternTableId; // => 1
ppuCtrl.spriteSize; //               => 0
ppuCtrl.generateNMIOnVBlank; //      => 1
```

#### 🔍 Solo lectura

Los registros de solo lectura son poblados por la PPU 🖥️. Los juegos pueden leer su estado mediante lecturas de memoria ejecutadas por la CPU 🧠. Algunas lecturas también pueden desencadenar otros efectos inmediatos.

```javascript
import InMemoryRegister from "/lib/InMemoryRegister";

class PPUStatus extends InMemoryRegister.PPU {
  onLoad() {
    this.addWritableField("spriteOverflow", 5) //    bit 5
      .addWritableField("sprite0Hit", 6) //          bit 6
      .addWritableField("isInVBlankInterval", 7); // bit 7

    this.setValue(0b10000000); // ¡aquí puedes establecer un estado inicial!
  }

  onRead(value) {
    return this.value; // esto cambiará según los campos escribibles
  }

  // cuando onWrite(...) no está definido, las escrituras no tendrán efecto
}

const ppuStatus = new PPUStatus(ppu);
ppuStatus.onRead(); // 0b10000000

ppuStatus.isInVBlankInterval = 0;
ppuStatus.onRead(); // 0b00000000

ppuStatus.isInVBlankInterval = 1;
ppuStatus.spriteOverflow = 1;
ppuStatus.onRead(); // 0b10100000

ppuStatus.sprite0Hit = 1;
ppuStatus.onRead(); // 0b11100000
```
