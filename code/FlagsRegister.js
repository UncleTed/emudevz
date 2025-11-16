import byte from "../lib/byte.js";

export default class FlagsRegister {
	constructor() {
		this.c = false;
		this.z = false;
		this.i = false;
		this.d = false;
		this.four_B = false;
		this.five = true;
		this.v = false;
		this.n = false;

		//   7  bit  0
		// ---- ----
		//   NV1B DIZC
		//   |||| ||||
		//   |||| |||+- Carry
		//   |||| ||+-- Zero
		//   |||| |+--- Interrupt Disable
		//   |||| +---- Decimal
		//   |||+------ (No CPU effect; see: the B flag)
		//   ||+------- (No CPU effect; always pushed as 1)
		//   |+-------- Overflow
		//   +--------- Negative

		this.bitOrder = {
			0: () => this.c,
			1: () => this.z,
			2: () => this.i,
			3: () => this.d,
			// 4:  () => this.b,
			5: () => this.five,
			6: () => this.v,
			7: () => this.n,
		};
	}

	getValue() {
		return byte.bitfield(
			this.c,
			this.z,
			this.i,
			this.d,
			this.four_B,
			this.five,
			this.v,
			this.n
		);
	}

	setValue(value) {
		if (value == 255) {
			this.c = true;
			this.z = true;
			this.i = true;
			this.d = true;
			this.four_B = false;
			this.five = true;
			this.v = true;
			this.n = true;
		} else {
			this.c = byte.getFlag(value, 0);
			this.z = byte.getFlag(value, 1);
			this.i = byte.getFlag(value, 2);
			this.d = byte.getFlag(value, 3);
			this.four_B = byte.getFlag(value, 4);
			// this.five = byte.getFlag(value, 5);
			this.v = byte.getFlag(value, 6);
			this.n = byte.getFlag(value, 7);
		}
	}

	updateZero(value) {
		if (value == 0) {
			this.z = true;
		} else {
			this.z = false;
		}
	}

	updateNegative(value) {
		if (byte.isNegative(value)) {
			this.n = true;
		} else {
			this.n = false;
		}
	}

	updateZeroAndNegative(value) {
		this.updateZero(value);
		this.updateNegative(value);
	}
}
