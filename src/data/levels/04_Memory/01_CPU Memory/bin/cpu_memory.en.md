# CPU Memory Map

| Address range | Size    | Device                                     |
| ------------- | ------- | ------------------------------------------ |
| `$0000-$07FF` | `$0800` | 🐏 `2` KiB internal RAM                    |
| `$0800-$1FFF` | `$1800` | 🚽 Mirrors of `$0000-$07FF`                |
| `$2000-$2007` | `$0008` | 🖥️ PPU registers                           |
| `$2008-$3FFF` | `$1FF8` | 🚽 Mirrors of `$2000-$2007`                |
| `$4000-$4013` | `$0014` | 🔊 APU registers                           |
| `$4014-$4014` | `$0001` | 🖥️ PPU's OAMDMA register                   |
| `$4015-$4015` | `$0001` | 🔊 APUStatus / APUControl registers        |
| `$4016-$4016` | `$0001` | 🎮 Controller port 1                       |
| `$4017-$4017` | `$0001` | 🎮 Controller port 2 / 🔊 APUFrameCounter  |
| `$4018-$401F` | `$0008` | 🧸 Unused                                  |
| `$4020-$FFFF` | `$BFE0` | 💾 Cartridge space (PRG-ROM, mapper, etc.) |

<br/>

🚽 **Mirror hint:**

```
byte.getMirroredAddress(address, mirrorRangeStart, mirrorRangeEnd, targetRangeStart, targetRangeEnd)
// ^ example:
// read(0x2009) ==
// read(byte.getMirroredAddress(0x2009, 0x2008, 0x3fff, 0x2000, 0x2007)) ==
// read(0x2001)
```
