export const solution = (input) => {
	const answers = [null, null];

	const matches = input.match(
		/Register A: (?<A>\d+)\nRegister B: (?<B>\d+)\nRegister C: (?<C>\d+)\n\nProgram: (?<instructions>[\d,]+)/,
	);
	const { A, B, C, instructions } = matches.groups;
	const initialState = [+A, +B, +C];
	const program = instructions.split(',').map(Number);

	const OPCODE = {
		ADV: 0, // division -> A
		BXL: 1, // bitwise XOR (B & literal)
		BST: 2, // modulo 8
		JNZ: 3, // jump not zero
		BXC: 4, // bitwise XOR (B & C)
		OUT: 5, // output
		BDV: 6, // division -> B
		CDV: 7, // division -> C
	};

	let early = 0;
	const run = (a = initialState[0]) => {
		const registers = [...initialState];
		registers[0] = a;
		let pointer = 0;
		let output = [];
		while (pointer < program.length) {
			const opcode = program[pointer];
			let operand = program[pointer + 1];

			let comboOperand = operand;
			switch (operand) {
				case 4:
				case 5:
				case 6:
					comboOperand = registers[operand - 4];
					break;
				case 7:
					comboOperand = NaN;
					break;
			}

			pointer = pointer + 2;

			switch (opcode) {
				case OPCODE.ADV: {
					registers[0] = parseInt(registers[0] / 2 ** comboOperand);
					break;
				}
				case OPCODE.BXL: {
					registers[1] = (registers[1] ^ operand) >>> 0;
					break;
				}
				case OPCODE.BST: {
					registers[1] = comboOperand % 8;
					break;
				}
				case OPCODE.JNZ: {
					if (registers[0] !== 0) {
						pointer = operand;
					}
					break;
				}
				case OPCODE.BXC: {
					registers[1] = (registers[1] ^ registers[2]) >>> 0;
					break;
				}
				case OPCODE.OUT: {
					output.push(comboOperand % 8);
					break;
				}
				case OPCODE.BDV: {
					registers[1] = parseInt(registers[0] / 2 ** comboOperand);
					break;
				}
				case OPCODE.CDV: {
					registers[2] = parseInt(registers[0] / 2 ** comboOperand);
					break;
				}
			}
		}
		return output.join(',');
	};

	answers[0] = run();

	const valid = [];
	const queue = [0];
	while (queue.length) {
		for (let val = queue.pop(), i = val; i < val + 8; ++i) {
			const result = run(i);
			if (result == instructions) {
				valid.push(i);
				answers[1] = i;
				break;
			}
			if (instructions.endsWith(result)) {
				queue.push(i * 8);
			}
		}
	}

	answers[1] = Math.min(...valid);

	return answers;
};
