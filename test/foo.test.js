// 3.3 The magic constant
import { expect } from "chai";
import byte from "../src/utils/byte.js";
import Cartridge from "./myCartridge.js";

it("instantiating a `Cartridge` with a <valid header> saves a `bytes` property", () => {
	const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a]);
	expect(new Cartridge(bytes).bytes).to.equal(bytes, "bytes");
});

it("instantiating a `Cartridge` with an <invalid header> throws an error", () => {
	[
		[0x11, 0x22, 0x33, 0x44],
		[0x99, 0x45, 0x53, 0x1a],
		[0x4e, 0x99, 0x53, 0x1a],
		[0x4e, 0x45, 0x99, 0x1a],
		[0x4e, 0x45, 0x53, 0x99],
	].forEach((wrongBytes) => {
		const bytes = new Uint8Array(wrongBytes);
		expect(() => new Cartridge(bytes)).to.throw(Error, /Invalid ROM/);
	});
});

// 3.4 Reading the header

it("has a `header` property with <metadata> (PRG-ROM pages)", () => {
	// prettier-ignore
	const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

	for (let i = 0; i < 256; i++) {
		bytes[4] = i;
		const header = new Cartridge(bytes).header;
		expect(header, "header").to.be.an("object");
		expect(header).to.include.key("prgRomPages");
		expect(header.prgRomPages).to.equal(i, "prgRomPages");
	}
});

it("has a `header` property with <metadata> (CHR-ROM pages)", () => {
	// prettier-ignore
	const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

	for (let i = 0; i < 256; i++) {
		bytes[5] = i;
		const header = new Cartridge(bytes).header;
		expect(header, "header").to.be.an("object");
		expect(header).to.include.key("chrRomPages");
		expect(header.chrRomPages).to.equal(i, "chrRomPages");
		expect(header).to.include.key("usesChrRam");
		expect(header.usesChrRam).to.equal(i === 0, "usesChrRam");
	}
});

it("has a `header` property with <metadata> (512-byte padding)", () => {
	// prettier-ignore
	const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

	[
		[false, 0b00000000],
		[true, 0b00000100],
	].forEach(([has512BytePadding, flags6]) => {
		bytes[6] = flags6;
		const header = new Cartridge(bytes).header;
		expect(header, "header").to.be.an("object");
		expect(header).to.include.key("has512BytePadding");
		expect(header.has512BytePadding).to.equal(
			has512BytePadding,
			"has512BytePadding"
		);
	});
});

it("has a `header` property with <metadata> (PRG-RAM presence)", () => {
	// prettier-ignore
	const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

	[
		[false, 0b00000000],
		[true, 0b00000010],
	].forEach(([hasPrgRam, flags6]) => {
		bytes[6] = flags6;
		const header = new Cartridge(bytes).header;
		expect(header, "header").to.be.an("object");
		expect(header).to.include.key("hasPrgRam");
		expect(header.hasPrgRam).to.equal(hasPrgRam, "hasPrgRam");
	});
});

it("has a `header` property with <metadata> (mirroring id)", () => {
	// prettier-ignore
	const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

	[
		["HORIZONTAL", 0b00000000],
		["VERTICAL", 0b00000001],
		["FOUR_SCREEN", 0b00001001],
		["FOUR_SCREEN", 0b00001000],
	].forEach(([mirroringId, flags6]) => {
		bytes[6] = flags6;
		const header = new Cartridge(bytes).header;
		expect(header, "header").to.be.an("object");
		expect(header).to.include.key("mirroringId");
		expect(header.mirroringId).to.equal(mirroringId, "mirroringId");
	});
});

it("has a `header` property with <metadata> (mapper id)", () => {
	// prettier-ignore
	const bytes = new Uint8Array([0x4e, 0x45, 0x53, 0x1a, byte.random(), byte.random(), byte.random(), byte.random()]);

	for (let i = 0; i < 256; i++) {
		const lowNybble = byte.lowNybbleOf(i);
		const highNybble = byte.highNybbleOf(i);
		bytes[6] = byte.buildU8(lowNybble, 0);
		bytes[7] = byte.buildU8(highNybble, 0);
		// console.log(" high-> ", bytes[7], " low-> ", bytes[6], "u8-> ", byte.buildU8(highNybble, lowNybble));

		expect(new Cartridge(bytes).header.mapperId).to.equal(i, "mapperId");
	}
});
const buildHeader = (withPadding, flags6, prgPages, chrPages) => {
	// prettier-ignore
	const header = [0x4e, 0x45, 0x53, 0x1a, prgPages, chrPages, flags6, 0b00000000, 0, 0, 0, 0, 0, 0, 0, 0];
	if (withPadding) header.push(...new Array(512).fill(0));
	return header;
};

const buildRom = (
	withPadding = false,
	flags6 = 0b00000000,
	prgPages = 1 + byte.random(3),
	chrPages = 1 + byte.random(3)
) => {
	const header = buildHeader(withPadding, flags6, prgPages, chrPages);
	const prg = [];
	const chr = [];
	for (let i = 0; i < prgPages * 16384; i++) prg.push(byte.random());
	for (let i = 0; i < chrPages * 8192; i++) chr.push(byte.random());
	const bytes = new Uint8Array([...header, ...prg, ...chr]);

	return { header, prg, chr, bytes };
};

it("regular array v uintarray", () => {
	const regular = [1, 2, 3];
	const anotherRegular = [1, 2, 3];
	const wat = new Uint8Array([1, 2, 3]);
	expect(regular, "regular").to.eql(anotherRegular);
	expect(new Uint8Array(regular), "uint").to.eql(wat);
});

it("`prg()` returns <the code> (no padding)", () => {
	const { prg, bytes } = buildRom();
	console.log("prg length: ", prg.length);
	console.log("bytes length: ", bytes.length);

	const cartridge = new Cartridge(bytes);
	expect(cartridge).to.respondTo("prg");
	const actualPrg = cartridge.prg();

	expect(prg[0]).to.eql(actualPrg[0]);
	expect(prg.length).to.equal(actualPrg.length);
	expect(actualPrg, "prg()").to.eql(new Uint8Array(prg));
});

it("`prg()` returns <the code> (with padding)", () => {
	const { prg, bytes } = buildRom(true, 0b00000100);

	const cartridge = new Cartridge(bytes);
	expect(cartridge).to.respondTo("prg");
	expect(cartridge.prg(), "prg()").to.eql(new Uint8Array(prg));
});
