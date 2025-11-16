import byte from "../lib/byte.js";
import interrupts from "../lib/interrupts.js";

const instructions = {
	// Add with Carry
	ADC: {
		argument: "value",
		run(cpu, val) {
			addWithCarry(cpu, val);
		},
	},

	// Arithmetic Shift Left
	ASL: {
		argument: "address",
		run(cpu, address) {
			const value = cpu.memory.read(address);
			const bit7 = byte.getBit(value, 7);
			cpu.flags.c = !!bit7;
			const newValue = value << 1;
			cpu.memory.write(address, newValue);
			cpu.flags.updateZeroAndNegative(newValue);
		},
	},

	// Arithmetic Shift Left accumulator
	ASLa: {
		argument: "no",
		run(cpu) {
			const value = cpu.a.getValue();
			const bit7 = byte.getFlag(value, 7);
			cpu.flags.c = bit7;
			const newValue = value << 1;
			cpu.a.setValue(newValue);
			cpu.flags.updateZeroAndNegative(newValue);
		},
	},

	// Decrement value at address
	DEC: {
		argument: "address",
		run(cpu, address) {
			const value = cpu.memory.read(address);
			const newValue = byte.toU8(value - 1);
			cpu.memory.write(address, newValue);
			cpu.flags.updateZeroAndNegative(newValue);
		},
	},

	// Decrement X register
	DEX: {
		argument: "no",
		run(cpu) {
			cpu.x.decrement();
			cpu.flags.updateZeroAndNegative(cpu.x.getValue());
		},
	},

	// Decrement Y register
	DEY: {
		argument: "no",
		run(cpu) {
			cpu.y.decrement();
			cpu.flags.updateZeroAndNegative(cpu.y.getValue());
		},
	},

	// Increment X Register
	INX: {
		argument: "no",
		run(cpu) {
			// Increments [X], updating the Z and N flags.
			cpu.x.increment();
			cpu.flags.updateZeroAndNegative(cpu.x.getValue());
		},
	},

	// Increment Memory
	INC: {
		argument: "address",
		run(cpu, addr) {
			// Adds one to the value held at <addr>, updating the Z and N flags.
			const value = cpu.memory.read(addr);
			const newValue = byte.toU8(value + 1);
			cpu.memory.write(addr, newValue);
			cpu.flags.updateZeroAndNegative(newValue);
		},
	},

	// Increment value at address
	INY: {
		argument: "no",
		run(cpu) {
			cpu.y.increment();
			cpu.flags.updateZeroAndNegative(cpu.y.getValue());
		},
	},

	// Logical Shift Right
	LSR: {
		argument: "address",
		run(cpu, address) {
			const value = cpu.memory.read(address);
			const bit0 = byte.getFlag(value, 0);
			cpu.flags.c = bit0;
			const newValue = value >> 1;
			cpu.memory.write(address, newValue);
			cpu.flags.updateZeroAndNegative(newValue);
		},
	},

	// Logical Shift Right Accumulator
	LSRa: {
		argument: "no",
		run(cpu) {
			const value = cpu.a.getValue();
			const bit0 = byte.getFlag(value, 0);
			cpu.flags.c = bit0;
			const newValue = value >> 1;
			cpu.a.setValue(newValue);
			cpu.flags.updateZeroAndNegative(newValue);
		},
	},

	// Rotate Left
	ROL: {
		argument: "address",
		run(cpu, address) {
			const value = cpu.memory.read(address);
			const bit7 = byte.getFlag(value, 7);
			const oldC = cpu.flags.c;
			cpu.flags.c = bit7;
			var newValue = value << 1;
			newValue = byte.setBit(newValue, 0, oldC);
			cpu.memory.write(address, newValue);
			cpu.flags.updateZeroAndNegative(newValue);
		},
	},

	// Rotate Left w Accumulator
	ROLa: {
		argument: "no",
		run(cpu) {
			const value = cpu.a.getValue();
			const bit7 = byte.getFlag(value, 7);
			const oldC = cpu.flags.c;
			cpu.flags.c = bit7;
			var newValue = value << 1;
			newValue = byte.setBit(newValue, 0, oldC);
			cpu.a.setValue(newValue);
			cpu.flags.updateZeroAndNegative(newValue);
		},
	},

	// Rotate Right
	ROR: {
		argument: "address",
		run(cpu, address) {
			const value = cpu.memory.read(address);
			const bit0 = byte.getFlag(value, 0);
			const oldC = cpu.flags.c;
			cpu.flags.c = bit0;
			var newValue = value >> 1;
			newValue = byte.setBit(newValue, 7, oldC);
			cpu.memory.write(address, newValue);
			cpu.flags.updateZeroAndNegative(newValue);
		},
	},

	// Rotate Right w Accumulator
	RORa: {
		argument: "no",
		run(cpu) {
			const value = cpu.a.getValue();
			const bit0 = byte.getFlag(value, 0);
			const oldC = cpu.flags.c;
			cpu.flags.c = bit0;
			var newValue = value >> 1;
			newValue = byte.setBit(newValue, 7, oldC);
			cpu.a.setValue(newValue);
			cpu.flags.updateZeroAndNegative(newValue);
		},
	},

	//Subtract with carry
	SBC: {
		argument: "value",
		run(cpu, value) {
			addWithCarry(cpu, 256 - value - 1);
		},
	},

	// DATA

	// Clear carry flag
	CLC: {
		argument: "no",
		run(cpu) {
			cpu.flags.c = false;
		},
	},

	// Clear decimal mode
	CLD: {
		argument: "no",
		run(cpu) {
			cpu.flags.d = false;
		},
	},

	// Clear interupt disable
	CLI: {
		argument: "no",
		run(cpu) {
			cpu.flags.i = false;
		},
	},

	// Clear overflow flag
	CLV: {
		argument: "no",
		run(cpu) {
			cpu.flags.v = false;
		},
	},

	// Load accumulator
	LDA: {
		argument: "value",
		run(cpu, value) {
			cpu.a.setValue(value);
			cpu.flags.updateZeroAndNegative(value);
		},
	},

	// Load X
	LDX: {
		argument: "value",
		run(cpu, value) {
			cpu.x.setValue(value);
			cpu.flags.updateZeroAndNegative(value);
		},
	},

	// Load Y
	LDY: {
		argument: "value",
		run(cpu, value) {
			cpu.y.setValue(value);
			cpu.flags.updateZeroAndNegative(value);
		},
	},

	// Push Accumulator onto Stack
	PHA: {
		argument: "no",
		run(cpu) {
			cpu.stack.push(cpu.a.getValue());
		},
	},

	// Push Processor Status
	PHP: {
		argument: "no",
		run(cpu) {
			var flags = cpu.flags.getValue();
			flags = byte.setBit(flags, 4, 1);
			cpu.stack.push(flags);
		},
	},

	// Pull Accumulator
	PLA: {
		argument: "no",
		run(cpu) {
			{
				const value = cpu.stack.pop();
				cpu.a.setValue(value);
				cpu.flags.updateZeroAndNegative(value);
			}
		},
	},

	// Pull Processor Status
	PLP: {
		argument: "no",
		run(cpu) {
			const value = cpu.stack.pop();
			cpu.flags.setValue(value);
		},
	},

	// Set Carry flag
	SEC: {
		argument: "no",
		run(cpu) {
			cpu.flags.c = true;
		},
	},

	// Set Decimal flag
	SED: {
		argument: "no",
		run(cpu) {
			cpu.flags.d = true;
		},
	},

	// Set Interupt disable
	SEI: {
		argument: "no",
		run(cpu) {
			cpu.flags.i = true;
		},
	},

	// Store accumulator
	STA: {
		argument: "address",
		run(cpu, address) {
			const value = cpu.a.getValue();
			cpu.memory.write(address, value);
		},
	},

	// Store X register
	STX: {
		argument: "address",
		run(cpu, address) {
			const value = cpu.x.getValue();
			cpu.memory.write(address, value);
		},
	},

	// Store Y register
	STY: {
		argument: "address",
		run(cpu, address) {
			const value = cpu.y.getValue();
			cpu.memory.write(address, value);
		},
	},

	// Transfer Accumulator to X
	TAX: {
		argument: "no",
		run(cpu) {
			const value = cpu.a.getValue();
			cpu.x.setValue(value);
			cpu.flags.updateZeroAndNegative(value);
		},
	},

	// Transfer Accumulator to Y
	TAY: {
		argument: "no",
		run(cpu) {
			const value = cpu.a.getValue();
			cpu.y.setValue(value);
			cpu.flags.updateZeroAndNegative(value);
		},
	},

	// Transfer SP to X
	TSX: {
		argument: "no",
		run(cpu) {
			const value = cpu.sp.getValue();
			cpu.x.setValue(value);
			cpu.flags.updateZeroAndNegative(value);
		},
	},

	// Transfer X to Accumulator
	TXA: {
		argument: "no",
		run(cpu) {
			const value = cpu.x.getValue();
			cpu.a.setValue(value);
			cpu.flags.updateZeroAndNegative(value);
		},
	},

	// Transfer X to SP
	TXS: {
		argument: "no",
		run(cpu) {
			const value = cpu.x.getValue();
			cpu.sp.setValue(value);
		},
	},

	// Transfer Y to Accumulator
	TYA: {
		argument: "no",
		run(cpu) {
			const value = cpu.y.getValue();
			cpu.a.setValue(value);
			cpu.flags.updateZeroAndNegative(value);
		},
	},

	// CHECKS

	// Bit Test
	BIT: {
		argument: "value",
		run(cpu, value) {
			const bit6 = byte.getFlag(value, 6);
			const bit7 = byte.getFlag(value, 7);
			cpu.flags.z = (value & cpu.a.getValue()) == 0;
			cpu.flags.v = bit6;
			cpu.flags.n = bit7;
		},
	},

	// Compare Accumulator with value
	CMP: {
		argument: "value",
		run(cpu, value) {
			const a = cpu.a.getValue();
			cpu.flags.z = value == a;
			cpu.flags.n = byte.getFlag(a - value, 7);
			cpu.flags.c = a >= value;
		},
	},

	// Compare X with value
	CPX: {
		argument: "value",
		run(cpu, value) {
			const x = cpu.x.getValue();
			cpu.flags.z = x == value;
			cpu.flags.n = byte.getFlag(x - value, 7);
			cpu.flags.c = x >= value;
		},
	},

	// Compare Y with value
	CPY: {
		argument: "value",
		run(cpu, value) {
			const y = cpu.y.getValue();
			cpu.flags.z = y == value;
			cpu.flags.n = byte.getFlag(y - value, 7);
			cpu.flags.c = y >= value;
		},
	},

	// Logical AND
	AND: {
		argument: "value",
		run(cpu, value) {
			const a = cpu.a.getValue();
			const result = a & value;
			cpu.a.setValue(result);
			cpu.flags.updateZeroAndNegative(result);
		},
	},

	// Exclusive OR
	EOR: {
		argument: "value",
		run(cpu, value) {
			const a = cpu.a.getValue();
			const result = a ^ value;
			cpu.a.setValue(result);
			cpu.flags.updateZeroAndNegative(result);
		},
	},

	// Logical inclusive OR
	ORA: {
		argument: "value",
		run(cpu, value) {
			const a = cpu.a.getValue();
			const result = a | value;
			cpu.a.setValue(result);
			cpu.flags.updateZeroAndNegative(result);
		},
	},

	// BRANCHING

	//Branch if Carry Clear
	BCC: {
		argument: "address",
		run(cpu, address) {
			jumpIf(cpu, address, !cpu.flags.c);
		},
	},

	// Branch if Carry Set
	BCS: {
		argument: "address",
		run(cpu, address) {
			jumpIf(cpu, address, cpu.flags.c);
		},
	},

	// Branch if equal
	BEQ: {
		argument: "address",
		run(cpu, address) {
			jumpIf(cpu, address, cpu.flags.z);
		},
	},

	// Branch if Minus
	BMI: {
		argument: "address",
		run(cpu, address) {
			jumpIf(cpu, address, cpu.flags.n);
		},
	},

	// Branch if Not Equal
	BNE: {
		argument: "address",
		run(cpu, address) {
			console.log(`branch if not equal flag ${cpu.flags.z}`);
			jumpIf(cpu, address, cpu.flags.z === false);
		},
	},

	// Branch if Positive
	BPL: {
		argument: "address",
		run(cpu, address) {
			jumpIf(cpu, address, !cpu.flags.n);
		},
	},

	// Branch If Overflow Clear
	BVC: {
		argument: "address",
		run(cpu, address) {
			jumpIf(cpu, address, !cpu.flags.v);
		},
	},

	// Branch if Overflow Set
	BVS: {
		argument: "address",
		run(cpu, address) {
			jumpIf(cpu, address, cpu.flags.v);
		},
	},

	// JUMP!
	JMP: {
		argument: "address",
		run(cpu, address) {
			cpu.pc.setValue(address);
		},
	},

	// JUMP to Subroutine
	JSR: {
		argument: "address",
		run(cpu, address) {
			const pc = cpu.pc.getValue();
			cpu.stack.push16(pc - 1);
			cpu.pc.setValue(address);
		},
	},

	// Return from Interrupt
	RTI: {
		argument: "no",
		run(cpu) {
			const flags = cpu.stack.pop();
			cpu.flags.setValue(flags);
			const pc = cpu.stack.pop16();
			cpu.pc.setValue(pc);
		},
	},

	// Return from Subroutine
	RTS: {
		argument: "no",
		run(cpu) {
			const value = cpu.stack.pop16();
			cpu.pc.setValue(value + 1);
		},
	},

	// System

	// Force Interupt
	BRK: {
		argument: "no",
		run(cpu) {
			cpu.interrupt(interrupts["IRQ"], true);
		},
	},

	// NOP
	NOP: {
		argument: "no",
		run() {},
	},
};

function jumpIf(cpu, address, condition) {
	if (condition) {
		cpu.pc.setValue(address);
		cpu.extraCycles = cpu.extraCycles + 1;
	} else {
		cpu.extraCycles = 0;
	}
}

function addWithCarry(cpu, value) {
	// Adds the contents of <val> to [A] together with the Carry Flag
	// ([A] = [A] + <val> + C), updating the Z and N flags.
	const oldValue = cpu.a.getValue();
	const result = oldValue + value + cpu.flags.c;
	const newValue = byte.toU8(result);
	cpu.a.setValue(newValue);
	cpu.flags.updateZeroAndNegative(newValue);

	// C and V flags are set in case of unsigned and signed overflow respectively.
	// Unsigned overflow occurs when the result is >= `256` (use `byte.overflows(...)`)
	// Signed overflow occurs when `Positive + Positive = Negative` or `Negative + Negative = Positive`
	cpu.flags.c = byte.overflows(result);
	cpu.flags.v =
		(byte.isPositive(oldValue) &&
			byte.isPositive(value) &&
			byte.isNegative(newValue)) ||
		(byte.isNegative(oldValue) &&
			byte.isNegative(value) &&
			byte.isPositive(newValue));
}

for (let key in instructions) {
	instructions[key].id = key;
}

export default instructions;
