import byte from "../lib/byte.js";

const unsupported = () => {
	throw new Error("Unsupported.");
};

function read(cpu, argument, hasPageCrossPenalty) {
	return cpu.memory.read(this.getAddress(cpu, argument, hasPageCrossPenalty));
}

function _highBytesAreDifferent(output, address) {
	return byte.highByteOf(output) != byte.highByteOf(address);
}

const addressingModes = {
	IMPLICIT: {
		inputSize: 0,
		getAddress: () => null,
		getValue: unsupported,
	},

	IMMEDIATE: {
		inputSize: 1,
		getAddress: unsupported,
		getValue: (cpu, value) => value,
	},

	ABSOLUTE: {
		inputSize: 2,
		getAddress: (cpu, address) => address,
		getValue: read,
	},

	ZERO_PAGE: {
		inputSize: 1,
		getAddress: (cpu, zeroPageAddress) => zeroPageAddress,
		getValue: read,
	},

	RELATIVE: {
		inputSize: 1,
		getAddress: (cpu, offset, hasPageCrossPenalty) => {
			const output = byte.toU16(cpu.pc.getValue() + byte.toS8(offset));
			if (
				hasPageCrossPenalty &&
				_highBytesAreDifferent(output, cpu.pc.getValue())
			) {
				cpu.extraCycles += 2;
			}

			return output;
		},
		getValue: unsupported,
	},

	INDIRECT: {
		inputSize: 2,
		getAddress: (cpu, absoluteAddress) => {
			console.log("calling read16 indirect");
			return cpu.memory.read16IndirectAddressingMode(absoluteAddress);
		},
		getValue: unsupported,
	},

	INDEXED_ZERO_PAGE_X: {
		inputSize: 1,
		getAddress: (cpu, zeroPageAddress) => {
			return byte.toU8(cpu.x.getValue() + zeroPageAddress);
		},
		getValue: read,
	},

	INDEXED_ZERO_PAGE_Y: {
		inputSize: 1,
		getAddress: (cpu, zeroPageAddress) => {
			return byte.toU8(cpu.y.getValue() + zeroPageAddress);
		},
		getValue: read,
	},

	INDEXED_ABSOLUTE_X: {
		inputSize: 2,
		getAddress: (cpu, absoluteAddress, hasPageCrossPenalty) => {
			const output = byte.toU16(cpu.x.getValue() + absoluteAddress);
			if (
				hasPageCrossPenalty &&
				_highBytesAreDifferent(output, absoluteAddress)
			) {
				cpu.extraCycles += 1;
			}
			return output;
		},
		getValue: read,
	},

	INDEXED_ABSOLUTE_Y: {
		inputSize: 2,
		getAddress: (cpu, absoluteAddress, hasPageCrossPenalty) => {
			const output = byte.toU16(cpu.y.getValue() + absoluteAddress);
			if (
				hasPageCrossPenalty &&
				_highBytesAreDifferent(output, absoluteAddress)
			) {
				cpu.extraCycles += 1;
			}
			return output;
		},
		getValue: read,
	},

	INDEXED_INDIRECT: {
		inputSize: 1,
		getAddress: (cpu, zeroPageAddress) => {
			const start = byte.toU8(zeroPageAddress + cpu.x.getValue());
			const end = byte.toU8(start + 1);
			return byte.buildU16(cpu.memory.read(end), cpu.memory.read(start));
		},
		getValue: read,
	},

	INDIRECT_INDEXED: {
		inputSize: 1,
		getAddress: (cpu, zeroPageAddress, hasPageCrossPenalty) => {
			const start = zeroPageAddress;
			const end = byte.toU8(start + 1);
			const baseAddress = byte.buildU16(
				cpu.memory.read(end),
				cpu.memory.read(start)
			);
			const output = byte.toU16(baseAddress + cpu.y.getValue());
			if (hasPageCrossPenalty && _highBytesAreDifferent(output, baseAddress)) {
				cpu.extraCycles += 1;
			}
			return output;
		},
		getValue: read,
	},
};

for (let key in addressingModes) {
	addressingModes[key].id = key;
}

export default addressingModes;
