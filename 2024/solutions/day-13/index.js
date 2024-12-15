const clamp = (a, v, b) => Math.min(b, Math.max(a, v));

export const solution = (input) => {
	const answers = [null, null];

	const machines = input.split('\n\n').map((block) => {
		const [a, b, prize] = block.split('\n').map((line) => {
			return line
				.replaceAll(/[^\d,]/g, '')
				.split(',')
				.map(Number);
		});

		return { a, b, prize };
	});

	const isInteger = (a) => Math.abs(a - Math.round(a)) < 0.001;

	const solve = (prize, a, mP, b, mB) => {
		const bPresses = (prize - a * mP) / (b + a * mB);
		const aPresses = (prize - b * bPresses) / a;
		return [aPresses, bPresses];
	};

	const getMinTokens = (adj = 0) => {
		const tokens = machines.map((machine) => {
			const { a, b, prize } = machine;
			prize[0] += adj;
			prize[1] += adj;
			const dA = a[0] - a[1];
			const dB = b[1] - b[0];
			const dP = prize[0] - prize[1];

			const [aPresses, bPresses] =
				dA !== 0
					? solve(prize[0], a[0], dP / dA, b[0], dB / dA)
					: solve(prize[0], b[0], -dP / dB, a[0], dA / dB).reverse();

			return isInteger(aPresses) && isInteger(bPresses)
				? aPresses * 3 + bPresses
				: 0;
		});
		return tokens.reduce((a, v) => a + v, 0);
	};

	answers[0] = getMinTokens();
	answers[1] = getMinTokens(10000000000000);

	return answers;
};
