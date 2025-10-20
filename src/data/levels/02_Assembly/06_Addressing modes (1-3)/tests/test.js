const { compile } = $;

let instructions, bytes;
beforeEach(() => {
	const compilation = compile();
	instructions = compilation.instructions;
	bytes = compilation.bytes;
	compilation.cpu.run();
});

it("the first 7 instructions are equal", () => {
	expect(instructions[0]?.line).to.equalN("INX", "1st instruction");
	expect(instructions[1]?.line).to.equalN("LDA #$08", "2nd instruction");
	expect(instructions[2]?.line).to.equalN("LDA $C002", "3rd instruction");
	expect(instructions[3]?.line).to.equalN("LDA $15", "4th instruction");
	expect(instructions[4]?.line).to.equalN("BNE @label", "5th instruction");
	expect(instructions[5]?.line).to.equalN("INY", "6th instruction");
	expect(instructions[6]?.line).to.equalN("INY", "7th instruction");
})({
	locales: { es: "las primeras 7 instrucciones son iguales" },
});

it("sets up an indirect jump to $403C", () => {
	expect(instructions[7]?.line).to.equalN("LDA #$3C", "8th instruction");
	expect(instructions[8]?.line).to.equalN("STA $4080", "9th instruction");
	expect(instructions[9]?.line).to.equalN("LDA #$40", "10th instruction");
	expect(instructions[10]?.line).to.equalN("STA $4081", "11th instruction");
	expect(instructions[11]?.line).to.equalN("JMP ($4080)", "12th instruction");
})({
	locales: { es: "configura un salto indirecto hacia $403C" },
});

it("the last 2 instructions are `STY $1001` and `INX`", () => {
	expect(instructions[instructions.length - 2]?.line).to.equalN(
		"STY $1001",
		"penultimate instruction"
	);
	expect(instructions[instructions.length - 1]?.line).to.equalN(
		"INX",
		"last instruction"
	);
})({
	locales: { es: "las últimas dos instrucciones son `STY $1001` y `INX`" },
});

it("the assembled code is OK", () => {
	// prettier-ignore
	expect(bytes).to.eql(
		new Uint8Array([0xe8, 0xa9, 0x08, 0xad, 0x02, 0xc0, 0xa5, 0x15, 0xd0, 0x02, 0xc8, 0xc8, 0xa9, 0x3c, 0x8d, 0x80, 0x40, 0xa9, 0x40, 0x8d, 0x81, 0x40, 0x6c, 0x80, 0x40, 0x8c, 0x01, 0x10, 0xe8])
	);
})({
	locales: { es: "el código ensamblado está bien" },
});
