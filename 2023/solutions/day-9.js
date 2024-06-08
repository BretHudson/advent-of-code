export const solution = (input) => {
	const answers = [null, null];

	const history = input
		.split('\n')
		.map((line) => line.split(' ').map((v) => +v));

	const getNextDigit = (sequence) => {
		const deltas = [];
		for (let i = 0; i < sequence.length - 1; ++i) {
			deltas.push(sequence[i + 1] - sequence[i]);
		}

		let nextDeltaDigit = 0;
		if (deltas.some((d) => d !== 0)) {
			nextDeltaDigit = getNextDigit(deltas);
		}
		return sequence.at(-1) + nextDeltaDigit;
	};

	answers[0] = history.map(getNextDigit).reduce((a, v) => a + v, 0);

	return answers;
};
