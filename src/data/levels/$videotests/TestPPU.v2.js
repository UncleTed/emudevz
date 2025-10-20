const byte = {
	/** Converts `s8` to an unsigned byte (-2 => 254). */
	/** It also forces `s8` to fit in 8 bits (257 => 1). */
	toU8(s8) {
		return s8 & 0xff;
	},

	/** Converts `u8` to a signed byte (254 => -2). */
	toS8(u8) {
		return (u8 << 24) >> 24;
	},

	/** Forces a `value` to fit in 16 bits (65537 => 1). */
	toU16(value) {
		return value & 0xffff;
	},

	/** Returns whether `u8` can be represented as a single byte or not. */
	overflows(u8) {
		return u8 >= 256;
	},

	/** Returns whether `s8` is positive or not. */
	isPositive(s8) {
		return !((s8 >> 7) & 1);
	},

	/** Returns whether `s8` is negative or not. */
	isNegative(s8) {
		return !!((s8 >> 7) & 1);
	},

	/** Returns the bit located at `position` in `number`, as a boolean. */
	getFlag(number, position) {
		return !!this.getBit(number, position);
	},

	/** Returns the bit located at `position` in `number`. */
	getBit(number, position) {
		return (number >> position) & 1;
	},

	/** Returns an updated `u8`, with a `bit` changed to `value` (0 or 1). */
	setBit(u8, bit, value) {
		const mask = 1 << bit;
		return (u8 & ~mask) | ((value & 0b1) << bit);
	},

	/** Returns a sub-number of `size` bits inside `u8`, starting at `startPosition`. */
	getBits(u8, startPosition, size) {
		return (u8 >> startPosition) & (0xff >> (8 - size));
	},

	/**
	 * Inserts a `value` of `size` bits inside `u8`, starting at `startPosition`.
	 * Returns the updated number.
	 */
	setBits(u8, startPosition, size, value) {
		const mask = ((1 << size) - 1) << startPosition;
		return (u8 & ~mask) | ((value << startPosition) & mask);
	},

	/** Returns the most significant byte of `u16`. */
	highByteOf(u16) {
		return u16 >> 8;
	},

	/** Returns the least significant byte of `u16`. */
	lowByteOf(u16) {
		return u16 & 0xff;
	},

	/** Returns a 16-bit number from `highByte` and `lowByte`. */
	buildU16(highByte, lowByte) {
		return ((highByte & 0xff) << 8) | (lowByte & 0xff);
	},

	/** Returns the upper nybble of `u8`. */
	highNybbleOf(u8) {
		return u8 >> 4;
	},

	/** Returns the lower nybble of `u8`. */
	lowNybbleOf(u8) {
		return u8 & 0b1111;
	},

	/** Returns an 8-bit number from `highNybble` and `lowNybble`. */
	buildU8(highNybble, lowNybble) {
		return ((highNybble & 0b1111) << 4) | (lowNybble & 0b1111);
	},

	/** Returns an 8-bit number from `bit0`, `bit1`, `bit2`, etc. */
	bitfield(bit0, bit1, bit2, bit3, bit4, bit5, bit6, bit7) {
		return (
			((bit0 & 1) << 0) |
			((bit1 & 1) << 1) |
			((bit2 & 1) << 2) |
			((bit3 & 1) << 3) |
			((bit4 & 1) << 4) |
			((bit5 & 1) << 5) |
			((bit6 & 1) << 6) |
			((bit7 & 1) << 7)
		);
	},

	/** Returns a 2-bit number from `highBit` and `lowBit`. */
	buildU2(highBit, lowBit) {
		return (highBit << 1) | lowBit;
	},

	/** Returns a random byte ([1, `max`]). */
	random(max = 254) {
		return 1 + Math.floor(Math.random() * max);
	},
};

class InMemoryRegister {
	constructor() {
		this.value = 0;
		this._readOnlyFields = [];

		this.onLoad();
	}

	/** Called when instantiating the register. */
	onLoad() {}

	/** Called when the CPU reads the memory address. */
	onRead() {
		return 0;
	}

	/** Called when the CPU writes the memory address. */
	onWrite(value) {}

	/** Sets the value manually (updating internal accessors). */
	setValue(value) {
		this.value = byte.toU8(value);
		this._writeReadOnlyFields();
	}

	/** Adds a read-only field of `size` bits named `name`, starting at `startPosition`. */
	addField(name, startPosition, size = 1) {
		this._readOnlyFields.push({ name, startPosition, size });
		this[name] = 0;

		return this;
	}

	/** Adds a writable field of `size` bits named `name`, starting at `startPosition`. */
	addWritableField(name, startPosition, size = 1) {
		Object.defineProperty(this, name, {
			get() {
				return byte.getBits(this.value, startPosition, size);
			},
			set(value) {
				this.value = byte.toU8(
					byte.setBits(this.value, startPosition, size, value)
				);
			},
		});

		return this;
	}

	_writeReadOnlyFields() {
		for (let { name, startPosition, size } of this._readOnlyFields)
			this[name] = byte.getBits(this.value, startPosition, size);
	}

	static get PPU() {
		return class PPUInMemoryRegister extends InMemoryRegister {
			constructor(ppu) {
				super();

				this.ppu = ppu;
			}
		};
	}

	static get APU() {
		return class APUInMemoryRegister extends InMemoryRegister {
			constructor(apu, id) {
				super();

				this.apu = apu;
				this.id = id;
			}
		};
	}
}

class PPUMemory {
	constructor() {
		/* TODO: IMPLEMENT */
	}

	onLoad(cartridge, mapper) {
		this.cartridge = cartridge;
		this.mapper = mapper;
	}

	read(address) {
		// 🕊️ Pattern tables 0 and 1 (mapper)
		if (address >= 0x0000 && address <= 0x1fff)
			return this.mapper.ppuRead(address);

		// 🏞️ Name tables 0 to 3 (VRAM + mirror)
		/* TODO: IMPLEMENT */

		// 🚽 Mirrors of $2000-$2EFF
		if (address >= 0x3000 && address <= 0x3eff)
			return this.read(0x2000 + ((address - 0x3000) % 0x1000));

		// 🎨 Palette RAM
		/* TODO: IMPLEMENT */

		// 🚽 Mirrors of $3F00-$3F1F
		if (address >= 0x3f20 && address <= 0x3fff)
			return this.read(0x3f00 + ((address - 0x3f20) % 0x0020));

		return 0;
	}

	write(address, value) {
		// 🕊️ Pattern tables 0 and 1 (mapper)
		if (address >= 0x0000 && address <= 0x1fff)
			return this.mapper.ppuWrite(address, value);

		// 🏞️ Name tables 0 to 3 (VRAM + mirror)
		/* TODO: IMPLEMENT */

		// 🚽 Mirrors of $2000-$2EFF
		if (address >= 0x3000 && address <= 0x3eff)
			return this.write(0x2000 + ((address - 0x3000) % 0x1000), value);

		// 🎨 Palette RAM
		/* TODO: IMPLEMENT */

		// 🚽 Mirrors of $3F00-$3F1F
		if (address >= 0x3f20 && address <= 0x3fff)
			return this.write(0x3f00 + ((address - 0x3f20) % 0x0020), value);
	}
}

class Tile {
	constructor(ppu, patternTableId, tileId, y) {
		const tableAddress = patternTableId * 4096;
		const lowPlaneAddress = tableAddress + tileId * 16;
		const highPlaneAddress = lowPlaneAddress + 8;

		this._lowRow = ppu.memory.read(lowPlaneAddress + y);
		this._highRow = ppu.memory.read(highPlaneAddress + y);
	}

	getColorIndex(x) {
		const bitNumber = 7 - x;
		const lowBit = byte.getBit(this._lowRow, bitNumber);
		const highBit = byte.getBit(this._highRow, bitNumber);

		return byte.buildU2(highBit, lowBit);
	}
}

class PPUCtrl extends InMemoryRegister.PPU {
	onLoad() {
		this.addField("nameTableId", 0, 2)
			.addField("vramAddressIncrement32", 2)
			.addField("sprite8x8PatternTableId", 3)
			.addField("backgroundPatternTableId", 4)
			.addField("spriteSize", 5)
			.addField("generateNMIOnVBlank", 7);
	}

	onWrite(value) {
		this.setValue(value);
	}
}

class PPUMask extends InMemoryRegister.PPU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		this.setValue(value);
	}
}

class PPUStatus extends InMemoryRegister.PPU {
	onLoad() {
		this.addWritableField("spriteOverflow", 5)
			.addWritableField("sprite0Hit", 6)
			.addWritableField("isInVBlankInterval", 7);

		this.setValue(0b10000000);
	}

	onRead() {
		return this.value;
	}
}

class OAMAddr extends InMemoryRegister.PPU {
	onWrite(value) {
		this.setValue(value);
	}
}

class OAMData extends InMemoryRegister.PPU {
	onRead() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class PPUScroll extends InMemoryRegister.PPU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class PPUAddr extends InMemoryRegister.PPU {
	onLoad() {
		this.latch = false;
		this.address = 0;
	}

	onWrite(value) {
		if (!this.latch) {
			this.address = byte.buildU16(value, byte.lowByteOf(this.address));
		} else {
			this.address = byte.buildU16(byte.highByteOf(this.address), value);
		}

		this.latch = !this.latch;
	}
}

class PPUData extends InMemoryRegister.PPU {
	onLoad() {
		/* TODO: IMPLEMENT */
	}

	onRead() {
		/* TODO: IMPLEMENT */
	}

	onWrite(value) {
		this.ppu.memory.write(this.ppu.registers.ppuAddr.address, value);
		this._incrementAddress();
	}

	_incrementAddress() {
		if (this.ppu.registers.ppuCtrl.vramAddressIncrement32) {
			this.ppu.registers.ppuAddr.address = byte.toU16(
				this.ppu.registers.ppuAddr.address + 32
			);
		} else {
			this.ppu.registers.ppuAddr.address = byte.toU16(
				this.ppu.registers.ppuAddr.address + 1
			);
		}
	}
}

class OAMDMA extends InMemoryRegister.PPU {
	onWrite(value) {
		/* TODO: IMPLEMENT */
	}
}

class VideoRegisters {
	constructor(ppu) {
		this.ppuCtrl = new PPUCtrl(ppu); //     $2000
		this.ppuMask = new PPUMask(ppu); //     $2001
		this.ppuStatus = new PPUStatus(ppu); // $2002
		this.oamAddr = new OAMAddr(ppu); //     $2003
		this.oamData = new OAMData(ppu); //     $2004
		this.ppuScroll = new PPUScroll(ppu); // $2005
		this.ppuAddr = new PPUAddr(ppu); //     $2006
		this.ppuData = new PPUData(ppu); //     $2007
		this.oamDma = new OAMDMA(ppu); //       $4014
	}

	read(address) {
		return this._getRegister(address)?.onRead();
	}

	write(address, value) {
		this._getRegister(address)?.onWrite(value);
	}

	_getRegister(address) {
		switch (address) {
			case 0x2000:
				return this.ppuCtrl;
			case 0x2001:
				return this.ppuMask;
			case 0x2002:
				return this.ppuStatus;
			case 0x2003:
				return this.oamAddr;
			case 0x2004:
				return this.oamData;
			case 0x2005:
				return this.ppuScroll;
			case 0x2006:
				return this.ppuAddr;
			case 0x2007:
				return this.ppuData;
			case 0x4014:
				return this.oamDma;
			default:
		}
	}
}

export default class PPU {
	constructor(cpu) {
		this.cpu = cpu;

		this.cycle = 0;
		this.scanline = -1;
		this.frame = 0;

		this.frameBuffer = new Uint32Array(256 * 240);
		this.memory = new PPUMemory();

		this.registers = new VideoRegisters(this);
	}

	plot(x, y, color) {
		this.frameBuffer[y * 256 + x] = color;
	}

	step(onFrame) {
		this.cycle++;
		if (this.cycle >= 341) {
			this.cycle = 0;
			this.scanline++;

			if (this.scanline >= 261) {
				this.scanline = -1;
				this.frame++;

				// <test>
				const testPalette = [0xff000000, 0xff555555, 0xffaaaaaa, 0xffffffff];
				const scale = 2;

				for (let tileId = 0; tileId < 240; tileId++) {
					const scaledSize = 8 * scale;
					const tilesPerRow = 256 / scaledSize;
					const startX = (tileId % tilesPerRow) * scaledSize;
					const startY = Math.floor(tileId / tilesPerRow) * scaledSize;

					for (let y = 0; y < 8; y++) {
						const tile = new Tile(this, 0, tileId, y);

						for (let x = 0; x < 8; x++) {
							const color = testPalette[tile.getColorIndex(x)];

							for (let scaledY = 0; scaledY < scale; scaledY++) {
								for (let scaledX = 0; scaledX < scale; scaledX++) {
									this.plot(
										startX + x * scale + scaledX,
										startY + y * scale + scaledY,
										color
									);
								}
							}
						}
					}
				}
				// </test>

				onFrame(this.frameBuffer);
			}
		}
	}
}
