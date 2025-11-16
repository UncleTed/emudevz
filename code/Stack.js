import byte from "../lib/byte.js";

export default class Stack {
	constructor(memory, sp) {
		this.memory = memory;
		this.sp = sp;
		this.currentAddress = 0x0100;
	}

	push(value) {
		this.memory.write(this.currentAddress + this.sp.getValue(), value);
		this.sp.decrement();
	}

	push16(value) {
		this.push(byte.highByteOf(value));
		this.push(byte.lowByteOf(value));
	}

	pop() {
		this.sp.increment();
		return this.memory.read(this.currentAddress + this.sp.getValue());
	}

	pop16() {
		let lowByte = this.pop();
		let highByte = this.pop();
		return byte.buildU16(highByte, lowByte);
	}
}
