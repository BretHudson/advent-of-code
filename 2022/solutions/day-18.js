export const solution = (input) => {
	const answers = [null, null];

	const strToVec = (line) => line.split(',').map(Number);

	const lavaCubes = input.split('\n').map(strToVec);

	const cubeSet = new Set();
	input.split('\n').forEach((cube) => {
		cubeSet.add(cube);
	});

	const offsets = [
		[-1, 0, 0],
		[1, 0, 0],
		[0, -1, 0],
		[0, 1, 0],
		[0, 0, -1],
		[0, 0, 1],
	];

	const getSides = (isLava) => (coord) => {
		return offsets
			.map((offset) => offset.map((o, i) => o + coord[i]))
			.filter((coord) => cubeSet.has(coord.join(',')) === isLava);
	};
	const getExposedSides = getSides(false);
	const getLavaSides = getSides(true);

	answers[0] = lavaCubes.flatMap(getExposedSides).length;

	const ranges = lavaCubes.reduce(
		(acc, cube) => {
			for (let i = 0; i < 3; ++i) {
				acc[i][0] = Math.min(acc[i][0], cube[i] - 1); // add padding
				acc[i][1] = Math.max(acc[i][1], cube[i] + 1); // add padding
			}
			return acc;
		},
		Array.from({ length: 3 }, () => [
			Number.POSITIVE_INFINITY,
			Number.NEGATIVE_INFINITY,
		]),
	);

	const floodStart = ranges.map((range) => range[0]);

	const isWithinRange = (v, [a, b]) => v >= a && v <= b;

	let exteriorSurfaceArea = 0;
	const visited = new Set();
	const queue = [floodStart];
	while (queue.length) {
		const current = queue.shift();

		const key = current.join(',');
		if (visited.has(key)) continue;
		visited.add(key);

		exteriorSurfaceArea += getLavaSides(current).length;

		const exposedSides = getExposedSides(current).filter((coord) => {
			return coord.every((axis, i) => isWithinRange(axis, ranges[i]));
		});
		queue.push(...exposedSides);
	}

	answers[1] = exteriorSurfaceArea;

	return answers;
};
