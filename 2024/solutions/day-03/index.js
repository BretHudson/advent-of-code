export const solution = (input) => {
	const answers = [null, null];

	const regex = /(do\(\)|don't\(\)|mul\((\d{1,3}),(\d{1,3})\))/g;
	const instructions = [];
	let matches;
	while ((matches = regex.exec(input))) {
		const [_, op, X, Y] = matches;
		instructions.push([op.split('(')[0], X, Y]);
	}

	const execute = (alwaysEnabled) => {
		const { sum } = instructions.reduce(
			({ sum, enabled }, [op, X, Y]) => {
				switch (op) {
					case 'mul':
						if (enabled) sum += X * Y;
						break;
					case "don't":
						enabled = alwaysEnabled || false;
						break;
					case 'do':
						enabled = true;
						break;
				}
				return { sum, enabled };
			},
			{ sum: 0, enabled: true },
		);
		return sum;
	};

	answers[0] = execute(true);
	answers[1] = execute(false);

	return answers;
};
