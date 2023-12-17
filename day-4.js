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

	const cardsWonMap = matchesPerCard.map((matchingNumbers, cardIndex) => {
		return Array.from({ length: matchingNumbers }, (v, offset) => {
			return cardIndex + offset + 1;
		});
	});

	// since cards can only reference cards after them, we can compute
	// the cache in descending order
	// this guarantees that any value retrieved from the cache has already
	// been computed
	const cache = Array.from({ length: cards.length });
	for (let c = cards.length - 1; c >= 0; --c) {
		cache[c] = cardsWonMap[c]
			.map((v) => cache[v])
			.reduce((acc, val) => acc + val, 1); // 1 includes the current card
	}

	answers[1] = cache.reduce((acc, val) => acc + val, 0);

	return answers;
};
