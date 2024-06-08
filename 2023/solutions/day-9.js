export const solution = (input) => {
	const answers = [null, null];

	const history = input
		.split('\n')
		.map((line) => line.split(' ').map((v) => +v));

	const getNextDelta = (sequence, callback) => {
		const deltas = [];
		for (let i = 0; i < sequence.length - 1; ++i) {
			deltas.push(sequence[i + 1] - sequence[i]);
		}

		let nextDeltaDigit = 0;
		if (deltas.some((d) => d !== 0)) {
			nextDeltaDigit = callback(deltas);
		}
		return nextDeltaDigit;
	};

	const getNextDigit = (sequence) => {
		return sequence.at(-1) + getNextDelta(sequence, getNextDigit);
	};

	const getPrevDigit = (sequence) => {
		return sequence.at(0) - getNextDelta(sequence, getPrevDigit);
	};

	answers[0] = history.map(getNextDigit).reduce((a, v) => a + v, 0);
	answers[1] = history.map(getPrevDigit).reduce((a, v) => a + v, 0);

	return answers;
};
