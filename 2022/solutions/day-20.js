export const solution = (input) => {
	const answers = [null, null];

	const values = input.split('\n').map((v) => ({
		original: Number(v),
		val: Number(v),
	}));

	const n = values.length;

	const rangeSign = (v, a, b) =>
		Math.sign(Math.sign(v - b) - Math.sign(a - v));

	const execute = (iterations, decryptionKey = 1) => {
		values.forEach((v) => {
			v.val = v.original * decryptionKey;
		});

		const list = [...values];

		for (let iter = 0; iter < iterations; ++iter) {
			for (let i = 0; i < n; ++i) {
				const v = values[i];

				const currentIndex = list.indexOf(v);
				list.splice(currentIndex, 1);

				const move = v.val % (n - 1);
				let nextIndex = currentIndex + move;
				nextIndex += rangeSign(nextIndex, 0, n);

				list.splice((nextIndex + n) % n, 0, v);
			}
		}

		const finalValues = list.map(({ val }) => val);
		const zeroIndex = finalValues.indexOf(0);
		return [1000, 2000, 3000]
			.map((v) => finalValues[(zeroIndex + v) % n])
			.reduce((a, v) => a + v);
	};

	answers[0] = execute(1);
	answers[1] = execute(10, 811589153);

	return answers;
};
