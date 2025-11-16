import byte from "../lib/byte.js";

export default class Cartridge {
	constructor(bytes) {
		this.bytes = bytes;

		if (!this._checkMagicConstant(bytes)) {
			throw new Error("Invalid ROM");
		}

		this.header = this._buildHeader(bytes);
	}

	prg() {
		let startingPosition = this._getPrgStartingPosition();
		return new Uint8Array(
			this.bytes.slice(
				startingPosition,
				startingPosition + 16384 * this.header.prgRomPages
			)
		);
	}

	chr() {
		if (this.header.chrRomPages > 0) {
			let startingPosition = this._getChrStartingPosition();
			return new Uint8Array(
				this.bytes.slice(
					startingPosition,
					startingPosition + 8192 * this.header.chrRomPages
				)
			);
		} else {
			return new Uint8Array(8192);
		}
	}

	_getChrStartingPosition() {
		if (this.header.chrRomPages > 0) {
			return this._getPrgStartingPosition() + 16384 * this.header.prgRomPages;
		}
	}

	_getPrgStartingPosition() {
		let startingPosition = 16;
		if (this.header.has512BytePadding) {
			startingPosition += 512;
		}
		return startingPosition;
	}
	_checkMagicConstant(bytes) {
		let MAGIC_CONSTANT = [0x4e, 0x45, 0x53, 0x1a];
		for (let i = 0; i < 4; i++) {
			if (bytes[i] != MAGIC_CONSTANT[i]) {
				return false;
			}
		}
		return true;
	}

	_buildHeader(bytes) {
		let m = "HORIZONTAL";
		let fourScreen = byte.getFlag(bytes[6], 3);
		if (fourScreen) {
			m = "FOUR_SCREEN";
		} else if (byte.getFlag(bytes[6], 0)) {
			m = "VERTICAL";
		}
		return {
			prgRomPages: bytes[4],
			chrRomPages: bytes[5],
			usesChrRam: bytes[5] == 0,
			has512BytePadding: byte.getFlag(bytes[6], 2),
			hasPrgRam: byte.getFlag(bytes[6], 1),
			mirroringId: m,
			mapperId: this._buildMapperId(bytes),
		};
	}

	_buildMapperId(bytes) {
		let h = byte.highNybbleOf(bytes[7]);
		let l = byte.highNybbleOf(bytes[6]);
		// console.log("h->",h);
		// console.log("l->", l);
		// console.log("u->", byte.buildU8(h, l))
		return byte.buildU8(h, l);
	}
}
