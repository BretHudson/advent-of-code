export const solution = (input) => {
	const answers = [null, null];

	const pairs = input.split('\n\n').map((chunk) => {
		return chunk.split('\n').map(JSON.parse);
	});

	const compare = (left, right) => {
		let diff = 0;
		for (let i = 0, n = left.length; !diff && i < n; ++i) {
			const a = left[i];
			const b = right[i];
			if (b === undefined) {
				diff = 1;
				continue;
			}
			const aType = typeof a;
			const bType = typeof b;
			if (aType === 'object' || bType === 'object') {
				diff = compare([a].flat(), [b].flat());
				continue;
			}

			diff = Math.sign(a - b);
		}

		if (diff === 0 && left.length < right.length) diff = -1;

		return diff;
	};

	for (let p = 0; p < pairs.length; ++p) {
		const pair = pairs[p];
		const diff = compare(...pair);
		if (diff <= 0) answers[0] += p + 1;
	}

	const dividerPackets = [[[2]], [[6]]];
	const allInputs = pairs.flat().concat(dividerPackets).sort(compare);

	answers[1] = dividerPackets
		.map((packet) => allInputs.indexOf(packet) + 1)
		.reduce((acc, v) => acc * v, 1);

	return answers;
};
