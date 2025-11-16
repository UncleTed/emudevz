import fs from "node:fs";
import _ from "lodash";
import CPU from "../code/CPU.js";
import CPUMemory from "../code/CPUMemory.js";
import Cartridge from "../code/Cartridge.js";
import NROM from "../lib/0_NROM.js";
import byte from "../lib/byte.js";
import chai from "../lib/chai.js";
import TheLogger from "./theLogger.js";

const expect = chai.expect;

const NEEESTEST_PATH = "./test/NEEEStest.neees";
const LOG_PATH = "./test/golden.log";
const NEWLINE = /\n|\r\n|\r/;
const ENTRY_POINT = 0xc000;

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

describe("The golden log test", () => {
	let goldenLogLines;
	before(() => {
		goldenLogLines = fs.readFileSync(LOG_PATH).toString("UTF8").split(NEWLINE);
		expect(goldenLogLines.length).to.equal(5004);
	});

	it("can match the golden log", () => {
		const test_rom_file = fs.readFileSync(NEEESTEST_PATH);
		const test_rom = new Uint8Array(test_rom_file);

		const cpuMemory = new CPUMemory(newRom(test_rom, []));

		const cartridge = new Cartridge(cpuMemory.ram);

		const cpu = new CPU(cpuMemory);
		const ppu = {};
		const mapper0 = new NROM(cpu, ppu, cartridge);
		cpuMemory.onLoad({}, {}, mapper0, []);
		var logger = new TheLogger();
		cpu.logger = (a, b, c, d, e) => logger.log(a, b, c, d, e);

		cpu.pc.setValue(ENTRY_POINT);

		let cycles = 0;
		let counter = 0;
		while (true) {
			try {
				cycles += cpu.step();
				expect(logger.lastLog).to.equal(
					goldenLogLines[counter].split(/[ ,]+/)[0],
					`line number ${counter} cycles ${cycles}`
				);
				counter += 1;
			} catch (e) {
				throw e;
				break;
			}
		}
	});
});
