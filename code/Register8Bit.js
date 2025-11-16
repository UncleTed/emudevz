import byte from "../lib/byte.js";

export default class Register8Bit {
	constructor() {
		this.register = 0;
	}

	getValue() {
		return this.register;
	}

	setValue(value) {
		this.register = byte.toU8(value);
	}

	increment() {
		this.setValue(this.getValue() + 1);
	}

	decrement() {
		this.setValue(this.getValue() - 1);
	}
}
