export const solution = (input) => {
	const answers = [null, null];

	const [inputsStr, gatesStr] = input.split('\n\n');

	const bitCount = inputsStr.split('\n').length / 2;

	const wires = Object.fromEntries(
		inputsStr.split('\n').map((line) => {
			const [name, v] = line.split(': ');
			return [name, +v];
		}),
	);

	const instructions = gatesStr.split('\n').map((line) => {
		const [i1, gate, i2, _, output] = line.split(' ');
		return {
			inputs: [i1, i2],
			gate,
			output,
			originalOutput: output,
		};
	});

	const outputWires = instructions.map(({ output }) => output);
	outputWires.forEach((output) => (wires[output] = null));

	const queue = [...instructions];
	while (queue.length) {
		const instr = queue.shift();
		const { inputs, gate, output } = instr;

		const [a, b] = inputs.map((i) => wires[i]);
		if (a === null || b === null) {
			queue.push(instr);
			continue;
		}

		let result = null;
		switch (gate) {
			case 'AND':
				result = a & b;
				break;
			case 'XOR':
				result = a ^ b;
				break;
			case 'OR':
				result = a | b;
				break;
		}
		wires[output] = result;
	}

	const getBinary = (letter) => {
		const binary = Object.entries(wires)
			.filter(([k]) => k.startsWith(letter))
			.filter(([k]) => !Number.isNaN(+k.slice(1, 3)))
			.sort(([a], [b]) => a.localeCompare(b))
			.reduce((a, [, v]) => v + a, '');

		return parseInt(binary, 2);
	};

	answers[0] = getBinary('z');

	const anyWiresStartWithXYZ = (inputs, output) => {
		return ['x', 'y', 'z'].every((c) => {
			return (
				inputs.every((i) => !i.startsWith(c)) && !output.startsWith(c)
			);
		});
	};

	const needToSwap = new Set();
	for (let i = 0; i < instructions.length; ++i) {
		const { inputs, gate, output } = instructions[i];

		if (inputs.includes('x00') || output === `z${bitCount}`) continue;

		if (output.startsWith('z') && gate !== 'XOR') {
			needToSwap.add(output);
		}

		if (gate === 'XOR') {
			if (anyWiresStartWithXYZ(inputs, output)) {
				needToSwap.add(output);
			}

			for (let j = 0; j < instructions.length; ++j) {
				const sub = instructions[j];
				if (sub.inputs.includes(output) && sub.gate === 'OR') {
					needToSwap.add(output);
				}
			}
		}

		if (gate === 'AND') {
			for (let j = 0; j < instructions.length; ++j) {
				const sub = instructions[j];
				if (sub.inputs.includes(output) && sub.gate !== 'OR') {
					needToSwap.add(output);
				}
			}
		}
	}

	answers[1] = [...needToSwap].sort();

	return answers;
};
