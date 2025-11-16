import byte from "../lib/byte.js";

export default class Register16Bit {
	constructor() {
		this.register = 0;
	}

	getValue() {
		return this.register;
	}

	setValue(value) {
		this.register = byte.toU16(value);
	}

	increment() {
		this.setValue(this.getValue() + 1);
	}

	decrement() {
		this.setValue(this.getValue() - 1);
	}
}
