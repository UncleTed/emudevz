import byte from "../lib/byte.js";
import defineOperations from "../lib/defineOperations.js";
import FlagsRegister from "./FlagsRegister.js";
import Register8Bit from "./Register8Bit.js";
import Register16Bit from "./Register16Bit.js";
import Stack from "./Stack.js";
import addressingModes from "./addressingModes.js";
import instructions from "./instructions.js";

const whoops = function () {
	debugger;
};

export default class CPU {
	constructor(cpuMemory) {
		this.memory = cpuMemory;
		this.cycle = 0;
		this.extraCycles = 0;
		this.a = new Register8Bit();
		this.x = new Register8Bit();
		this.y = new Register8Bit();
		this.sp = new Register8Bit();
		this.pc = new Register16Bit();
		this.flags = new FlagsRegister();
		this.stack = new Stack(this.memory, this.sp);
		this.operations = defineOperations(instructions, addressingModes);
	}

	interrupt(interrupt, withBFlag = false) {
		if (interrupt.id == "IRQ" && this.flags.i) {
			return 0;
		}
		var flags = this.flags.getValue();
		if (withBFlag) flags = byte.setBit(flags, 4, 1);
		const pc = this.pc.getValue();
		this.stack.push16(pc);
		this.stack.push(flags);
		this.flags.i = true;
		this.cycle += 7;
		const vector = interrupt.vector;
		const address = this.memory.read16(vector);
		this.pc.setValue(address);
	}

	step() {
		const originalPC = this.pc.getValue();
		if (originalPC === 0xc9fe) {
			whoops();
		}
		const operation = this._fetchOperation();
		const input = this._fetchInput(operation);
		const argument = this._fetchArgument(operation, input);

		if (this.logger != null) {
			this.logger(this, originalPC, operation, input, argument);
		}
		operation.instruction.run(this, argument);
		return this._addCycles(operation);
	}

	_fetchOperation() {
		const opcode = this.memory.read(this.pc.getValue());
		const operation = this.operations[opcode];
		if (operation == null) {
			throw new Error("Invalid opcode");
		}
		this.pc.increment();
		return operation;
	}

	_fetchInput(operation) {
		const inputSize = operation.addressingMode.inputSize;
		var input;
		if (inputSize == 0) {
			return null;
		}
		if (inputSize == 1) {
			input = this.memory.read(this.pc.getValue());
			this.pc.increment();
			return input;
		}
		if (inputSize == 2) {
			if (operation.addresingMode === addressingModes.INDIRECT) {
				input = this.memory.read16IndirectAddressingMode(this.pc.getValue());
				this.pc.increment();
				this.pc.increment();
				return input;
			} else {
				input = this.memory.read16(this.pc.getValue());
				this.pc.increment();
				this.pc.increment();
				return input;
			}
		}
	}

	_fetchArgument(operation, input) {
		if (operation.instruction.argument === "value") {
			return operation.addressingMode.getValue(
				this,
				input,
				operation.hasPageCrossPenalty
			);
		} else {
			return operation.addressingMode.getAddress(
				this,
				input,
				operation.hasPageCrossPenalty
			);
		}
	}

	_addCycles(operation) {
		const cycles = operation.cycles + this.extraCycles;
		this.cycle += cycles;
		this.extraCycles = 0;
		return cycles;
	}
}
