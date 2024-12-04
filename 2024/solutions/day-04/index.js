export const solution = (input) => {
	const answers = [null, null];

	const xCoords = [];
	const aCoords = [];
	const grid = input.split('\n').map((row, y) => {
		const letters = row.split('');
		letters.forEach((letter, x) => {
			if (letter === 'X') xCoords.push([x, y]);
			if (letter === 'A') aCoords.push([x, y]);
		});
		return letters;
	});

	const orthoShapes = [];
	for (let yDir = -1; yDir <= 1; ++yDir) {
		for (let xDir = -1; xDir <= 1; ++xDir) {
			if (xDir === 0 && yDir === 0) continue;
			orthoShapes.push([
				[xDir, yDir],
				[xDir * 2, yDir * 2],
				[xDir * 3, yDir * 3],
			]);
		}
	}

	const xShape = [
		[-1, -1],
		[1, -1],
		[1, 1],
		[-1, 1],
	];

	const getNeighbors = (coord, shape) => {
		return shape
			.map((offset) => offset.map((v, i) => v + coord[i]))
			.map(([x, y]) => grid[y]?.[x])
			.filter(Boolean)
			.join('');
	};

	const findOccurences = (coords, shapes, against) => {
		return coords
			.map((coord) => {
				return shapes.filter((shape) => {
					const neighbors = getNeighbors(coord, shape);
					return against.indexOf(neighbors) > -1;
				}).length;
			})
			.reduce((a, v) => a + v, 0);
	};

	answers[0] = findOccurences(xCoords, orthoShapes, ['MAS']);
	answers[1] = findOccurences(
		aCoords,
		[xShape],
		['MMSS', 'MSSM', 'SSMM', 'SMMS'],
	);

	return answers;
};
