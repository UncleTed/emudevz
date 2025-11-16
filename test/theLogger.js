import _ from "lodash";

function hex(value, length) {
	return _.padStart(value.toString(16).toUpperCase(), length, "0");
}

export default class TheLogger {
	constructor() {
		this.lastLog = null;
	}

	log(cpu, originalPC, operation, input, argument) {
		const memory = cpu.memory;
		this.lastLog = hex(originalPC, 4);
	}
}
