import sinon from "sinon";
import CPU from "../code/CPU.js";
import CPUMemory from "../code/CPUMemory.js";
import Cartridge from "../code/Cartridge.js";
import NROM from "../lib/0_NROM.js";
import byte from "../lib/byte.js";
import chai from "../lib/chai.js";

const expect = chai.expect;

function newHeader(prgPages = 1, chrPages = 1, flags6 = 0, flags7 = 0) {
	// prettier-ignore
	return [0x4e, 0x45, 0x53, 0x1a, prgPages, chrPages, flags6, flags7, 0, 0, 0, 0, 0, 0, 0, 0];
}

function newRom(prgBytes = [], header = newHeader()) {
	const prg = prgBytes;
	const chr = [];
	for (let i = prgBytes.length; i < 16384; i++) prg.push(0);
	for (let i = 0; i < 8192; i++) chr.push(byte.random());
	const bytes = new Uint8Array([...header, ...prg, ...chr]);

	return bytes;
}

it("can run 4 simple operations, updating all counters, and calling a `logger` function", () => {
	// NOP ; LDA #$05 ; STA $0201 ; LDX $0201
	const cpuMemory = new CPUMemory(
		newRom([0xea, 0xa9, 0x05, 0x8d, 0x01, 0x02, 0xae, 0x01, 0x02])
	);

	const cartridge = new Cartridge(cpuMemory.ram);
	const mapper = {
		cpuRead: (address) => address,
		cpuWrite: () => {},
	};

	const cpu = new CPU(cpuMemory);
	const ppu = {};
	const mapper0 = new NROM(cpu, ppu, cartridge);
	cpuMemory.onLoad({}, {}, mapper0, []);

	expect(cpu).to.respondTo("step");
	let cycles;
	cpu.pc.setValue(0x8000);
	cpu.cycle = 7;

	// NOP
	cpu.logger = sinon.spy();
	cycles = cpu.step();
	expect(cycles).to.equal(2, "NOP => cycles");
	expect(cpu.pc.getValue()).to.equalHex(0x8001, "NOP => pc");
	expect(cpu.cycle).to.equal(9, "NOP => cycle");

	checkLogger(cpu.logger, cpu, 0x8000, cpu.operations[0xea], null, null);

	// LDA #$05
	cpu.logger = sinon.spy();
	cycles = cpu.step();
	expect(cycles).to.equalN(2, "LDA #$05 => cycles");
	expect(cpu.pc.getValue()).to.equalHex(0x8003, "LDA #$05 => pc");
	expect(cpu.cycle).to.equalN(11, "LDA #$05 => cycle");
	checkLogger(cpu.logger, cpu, 0x8001, cpu.operations[0xa9], 0x05, 0x05);

	// STA $0201
	cpu.logger = sinon.spy();
	cycles = cpu.step();
	expect(cycles).to.equalN(4, "STA $0201 => cycles");
	expect(cpu.pc.getValue()).to.equalHex(0x8006, "STA $0201 => pc");
	expect(cpu.cycle).to.equalN(15, "STA $0201 => cycle");
	checkLogger(cpu.logger, cpu, 0x8003, cpu.operations[0x8d], 0x0201, 0x0201);

	// LDX $0201
	cpu.logger = sinon.spy();
	cycles = cpu.step();
	expect(cycles).to.equalN(4, "LDX $0201 => cycles");
	expect(cpu.pc.getValue()).to.equalHex(0x8009, "LDX $0201 => pc");
	expect(cpu.cycle).to.equalN(19, "LDX $0201 => cycle");
	checkLogger(cpu.logger, cpu, 0x8006, cpu.operations[0xae], 0x0201, 0x0005);
});

function checkLogger(theSpy, cpu, orignalPC, operation, input, argument) {
	expect(theSpy.args.length).to.equal(1);
	let args = theSpy.args[0];
	expect(args.length).to.equal(5);
	expect(args[0]).to.equal(cpu, "cpu is wrong");
	expect(args[1]).to.equal(orignalPC, "program counter");
	expect(args[2]).to.equal(operation, "operation is wrong");
	expect(args[3]).to.equal(input, "input wrong");
	expect(args[4]).to.equal(argument, "argument wrong");
}
