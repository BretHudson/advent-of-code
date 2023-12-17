const parseBoundingBox = (pitch, converter) => (match) => {
	const { index } = match;
	const x = index % pitch;
	const y = Math.floor(index / pitch);
	const width = match[0].length;
	const height = 1;

	return {
		value: converter ? converter(match[0]) : match[0],
		// x/y/width/height
		x,
		y,
		width,
		height,
		// min/max x/y
		minX: x,
		maxX: x + width - 1,
		minY: y,
		maxY: y + height - 1,
	};
};

const checkPointOverlap = (point, box, radius = 0) => {
	return (
		point.x >= box.minX - radius &&
		point.x <= box.maxX + radius &&
		point.y >= box.minY - radius &&
		point.y <= box.maxY + radius
	);
};

export const solution = (input) => {
	const answers = [null, null];

	const pitch = input.indexOf('\n') + 1;

	const numbers = Array.from(input.matchAll(/\d+/g)).map(
		parseBoundingBox(pitch, Number),
	);

	const symbols = Array.from(input.matchAll(/[^\.\d\n]/g)).map(
		parseBoundingBox(pitch),
	);

	const numbersNextToSymbols = numbers.filter((number) => {
		return symbols.some((symbol) => checkPointOverlap(symbol, number, 1));
	});

	const gearRatiosSum = symbols.reduce((acc, symbol) => {
		if (symbol.value !== '*') return acc;

		const adjacentNumbers = numbers.filter((number) =>
			checkPointOverlap(symbol, number, 1),
		);
		if (adjacentNumbers.length !== 2) return acc;

		const gearRatio = adjacentNumbers.reduce((acc, v) => acc * v.value, 1);
		return acc + gearRatio;
	}, 0);

	answers[0] = numbersNextToSymbols.reduce((acc, v) => acc + v.value, 0);
	answers[1] = gearRatiosSum;

	return answers;
};
