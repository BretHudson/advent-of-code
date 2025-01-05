const parseEventMessage = (e) => {
	const input = e.data.input;
	const result = [null, null];
	const sendResult = () => {
		postMessage({
			result,
		});
	};

	return {
		input,
		result,
		sendResult,
	};
};

const _permutations = (xs) => {
	return xs.reduceRight(
		(a, i) => {
			return a.flatMap((xs) => {
				return [...Array(xs.length + 1).keys()].map((n) =>
					xs.slice(0, n).concat(i, xs.slice(n)),
				);
			});
		},
		[[]],
	);
};

Array.prototype.permutations = function () {
	return _permutations(this);
};

const _combinations = (k, xs, prefix = []) => {
	if (prefix.length === 0) xs = [...xs.keys()];
	if (k === 0) return [prefix];
	return xs.flatMap((v, i) =>
		_combinations(k - 1, xs.slice(i + 1), [...prefix, v]),
	);
};

Array.prototype.combinations = function (n) {
	if (n === undefined) return this.slice();
	return _combinations(n, [...this]).map((arr) => arr.map((i) => this[i]));
};

Array.prototype.transpose = function () {
	return this[0].map((_, colIndex) => this.map((row) => row[colIndex]));
};

const createComputer = (memory, input = []) => ({
	pointer: 0,
	input: [...input],
	output: [],
	relativeBase: 0,
	memory: [...memory],
	halted: false,
});

const [MODE_POSITION, MODE_IMMEDIATE, MODE_RELATIVE] = [0, 1, 2];
const [READ, WRITE] = [0, 1];

const opcodes = {
	1: {
		params: 3,
		types: [READ, READ, WRITE],
		exec: (computer, [a, b, c]) => {
			computer.memory[c] = a + b;
		},
	},
	2: {
		params: 3,
		types: [READ, READ, WRITE],
		exec: (computer, [a, b, c]) => {
			computer.memory[c] = a * b;
		},
	},
	3: {
		params: 1,
		types: [WRITE],
		exec: (computer, [a]) => {
			// if (computer.input.length === 0) return;
			computer.memory[a] = computer.input.shift();
		},
	},
	4: {
		params: 1,
		types: [READ],
		exec: (computer, [a]) => {
			computer.output.push(a);
		},
	},
	5: {
		params: 2,
		types: [READ, READ],
		exec: (computer, [a, b]) => {
			if (a !== 0) computer.pointer = b;
		},
	},
	6: {
		params: 2,
		types: [READ, READ],
		exec: (computer, [a, b]) => {
			if (a === 0) computer.pointer = b;
		},
	},
	7: {
		params: 3,
		types: [READ, READ, WRITE],
		exec: (computer, [a, b, c]) => {
			computer.memory[c] = a < b ? 1 : 0;
		},
	},
	8: {
		params: 3,
		types: [READ, READ, WRITE],
		exec: (computer, [a, b, c]) => {
			computer.memory[c] = a === b ? 1 : 0;
		},
	},
	9: {
		params: 1,
		types: [READ],
		exec: (computer, [a]) => {
			computer.relativeBase += a;
		},
	},
	99: {
		params: 0,
		exec: (computer) => {
			computer.halted = true;
		},
	},
};

const stepComputer = (computer) => {
	const prevPointer = computer.pointer;
	const code = computer.memory[computer.pointer];
	const opcode = code % 100;
	const modes = [
		Math.floor(code / 100) % 10,
		Math.floor(code / 1000) % 10,
		Math.floor(code / 10000) % 10,
	];
	const op = opcodes[opcode];
	const params = computer.memory.slice(
		computer.pointer + 1,
		computer.pointer + 1 + op.params,
	);
	for (let i = 0; i < op.params; ++i) {
		if (modes[i] !== MODE_IMMEDIATE) {
			if (modes[i] === MODE_RELATIVE) params[i] += computer.relativeBase;
			if (op.types[i] !== WRITE)
				params[i] = computer.memory[params[i]] ?? 0;
		}
	}
	op.exec(computer, params);

	if (computer.halted) return opcode;

	if (computer.pointer === prevPointer) {
		computer.pointer += op.params + 1;
	}

	return opcode;
};

const runComputer = (computer) => {
	while (true) {
		stepComputer(computer);
		if (computer.halted) break;
		// if (computer.output.length) break;
	}
};

// debug methods
const compareArrays = (a, b) => {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
};

const compare = (program, computer) => {
	if (program.position !== computer.pointer) {
		console.log(program.position, computer.pointer);
		throw new Error('pointers out of sync');
	}
	if (!compareArrays(program.intcodes, computer.memory)) {
		const a = program.intcodes;
		const b = computer.memory;
		console.log(program.intcodes);
		console.log(computer.memory);
		for (let i = 0; i < a.length; ++i) {
			if (a[i] !== b[i]) {
				console.log('index', i, a[i], b[i]);
			}
		}
		throw new Error('memory out of sync');
	}
	if (!compareArrays(program.input, computer.input)) {
		throw new Error('input out of sync');
	}
	if (!compareArrays(program.output, computer.output)) {
		throw new Error('output out of sync');
	}
};

const compareMachines = (program, computer, readIntcodes) => {
	compare(program, computer);
	for (let i = 0; !program.halted && !computer.halted && i < 1000; ++i) {
		console.clear();
		readIntcodes(program);
		stepComputer(computer);
		try {
			if (i < 206) compare(program, computer);
		} catch (e) {
			console.warn(i);
			throw e;
		}
	}
};
