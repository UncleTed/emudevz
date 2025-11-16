import _ from "lodash";
import byte from "../lib/byte.js";

export default class CPUMemory {
	// constructor() {
	//   this.ram = new Uint8Array(2048);
	// }

	constructor(mem) {
		this.ram = mem;
	}

	read(address) {
		if (address >= 0x0000 && address <= 0x07ff) {
			return this.ram[address];
		}

		// 🚽 Mirrors of $0000-$07FF
		if (address >= 0x0800 && address <= 0x1fff)
			return this.read(0x0000 + ((address - 0x0800) % 0x0800));

		// 🖥️ PPU registers
		/* TODO: IMPLEMENT */

		// 🚽 Mirrors of $2000-2007
		if (address >= 0x2008 && address <= 0x3fff)
			return this.read(0x2000 + ((address - 0x2008) % 0x0008));

		if (address == 0x4016) {
			return this.controllers[0].onRead();
		}

		if (address == 0x4017) {
			return this.controllers[1].onRead();
		}

		if (address >= 0x4020 && address <= 0xffff)
			return this.mapper.cpuRead(address);

		// 🔊 APU registers
		/* TODO: IMPLEMENT */

		// 🖥️ PPU's OAMDMA register
		/* TODO: IMPLEMENT */

		// 🔊 APUStatus register
		/* TODO: IMPLEMENT */

		// 🎮 Controller port 1
		/* TODO: IMPLEMENT */

		// 🎮 Controller port 2
		/* TODO: IMPLEMENT */

		// 💾 Cartridge space (PRG-ROM, mapper, etc.)
		/* TODO: IMPLEMENT */

		return 1;
	}

	hex(value, length) {
		return _.padStart(value.toString(16).toUpperCase(), length, "0");
	}

	read16(address) {
		console.log("calling plain read16");
		let lowByte = this.read(address);
		let highByte = this.read(address + 1);
		return byte.buildU16(highByte, lowByte);
	}

	read16IndirectAddressingMode(address) {
		console.log("calling read16 indirect");
		let lowByteAddress = byte.lowByteOf(address);
		let highByteAddress = byte.highByteOf(address);
		let mostSignificantByte;
		let leastSignificantByte;

		if (lowByteAddress === 0xff) {
			leastSignificantByte = this.read(address);
			let addressOfMostSignificantByte = byte.buildU16(highByteAddress, 0x00);
			mostSignificantByte = this.read(addressOfMostSignificantByte);
			return byte.buildU16(mostSignificantByte, leastSignificantByte);
		} else {
			return this.read16(address);
		}
	}

	write(address, value) {
		if (address >= 0x0000 && address <= 0x07ff) {
			this.ram[address] = value;
		}

		// 🚽 Mirrors of $0000-$07FF
		if (address >= 0x0800 && address <= 0x1fff)
			return this.write(0x0000 + ((address - 0x0800) % 0x0800), value);

		// 🖥️ PPU registers
		/* TODO: IMPLEMENT */

		// 🚽 Mirrors of $2000-2007
		if (address >= 0x2008 && address <= 0x3fff)
			return this.write(0x2000 + ((address - 0x2008) % 0x0008), value);

		if (address == 0x4016) {
			return this.controllers[0].onWrite(value);
		}

		if (address >= 0x4020 && address <= 0xffff)
			return this.mapper.cpuWrite(address, value);

		// 🔊 APU registers
		/* TODO: IMPLEMENT */

		// 🖥️ PPU's OAMDMA register
		/* TODO: IMPLEMENT */

		// 🔊 APUControl register
		/* TODO: IMPLEMENT */

		// 🎮 Controller port 1
		/* TODO: IMPLEMENT */

		// 🔊 APUFrameCounter register
		/* TODO: IMPLEMENT */

		// 💾 Cartridge space (PRG-ROM, mapper, etc.)
		/* TODO: IMPLEMENT */
	}

	onLoad(ppu, apu, mapper, controllers) {
		this.ppu = ppu;
		this.apu = apu;
		this.mapper = mapper;
		this.controllers = controllers;
	}
}
