export const solution = (input) => {
	const answers = [null, null];

	const cards = input.split('\n').map((line) => {
		const [cardStr, valStr] = line.split(':').map((v) => v.trim());
		const [winningNumbers, numbers] = valStr.split(' | ').map((numbers) => {
			return numbers.split(/\s+/).map((v) => +v);
		});

		return { id: +cardStr.replace('Card ', ''), winningNumbers, numbers };
	});

	const matchesPerCard = cards.map(({ winningNumbers, numbers }) => {
		return numbers.filter((n) => winningNumbers.includes(n)).length;
	});

	const pointsPerCard = matchesPerCard.map((matchingNumbers) => {
		return Math.floor(Math.pow(2, matchingNumbers - 1));
	});

	answers[0] = pointsPerCard.reduce((acc, val) => acc + val, 0);

	return answers;
};
