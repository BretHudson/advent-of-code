export const solution = (input) => {
	const answers = [null, null];

	const lines = input.split('\n').map((line) => {
		const [testValue, numbersStr] = line.split(': ');
		return {
			testValue: +testValue,
			numbers: numbersStr.split(' ').map(Number),
		};
	});

	const getTotal = (concat = false) => {
		const validLines = lines.map((line) => {
			const { testValue, numbers } = line;

			const calc = (total, n) => {
				if (n >= numbers.length) return total == testValue;
				return (
					calc(+total + numbers[n], n + 1) ||
					calc(total * numbers[n], n + 1) ||
					(concat && calc(total.toString() + numbers[n], n + 1))
				);
			};

			return calc(numbers[0], 1) ? testValue : 0;
		});
		return validLines.map(Number).reduce((acc, val) => acc + val, 0);
	};

	answers[0] = getTotal();
	answers[1] = getTotal(true);

	return answers;
};
