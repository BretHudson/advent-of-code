export const solution = (input) => {
	const answers = [null, null];

	const grid2D = input.split('\n').map((v) => v.split(''));

	const width = grid2D[0].length;
	const height = grid2D.length;

	const grid = grid2D.flat().map((type) => ({
		type,
		distances: [],
	}));

	const getPos = (index) => [index % width, Math.floor(index / width)];
	const getIndex = (x, y) => y * width + x;
	const checkPos = (x, y, slope) => {
		const { type } = grid[getIndex(x, y)];
		return type === '.' || type === slope;
	};

	const startPos = getPos(grid.findIndex(({ type }) => type === '.'));
	const startCell = grid[getIndex(...startPos)];
	const endPos = getPos(grid.findLastIndex(({ type }) => type === '.'));
	const endCell = grid[getIndex(...endPos)];

	const queue = [];

	const addToQueue = (x, y, depth, pathIndex, slope) => {
		const { distances } = grid[getIndex(x, y)];
		if (typeof distances[pathIndex] === 'number') return;

		queue.push([x, y, depth, pathIndex, slope]);
	};

	addToQueue(...endPos, 0, 0);

	while (queue.length) {
		const curPos = queue.shift();
		const [x, y, depth, pathIndex, dir] = curPos;

		grid[getIndex(x, y)].distances[pathIndex] = depth;

		const goL = dir !== '<' && x > 0 && checkPos(x - 1, y, '>');
		const goR = dir !== '>' && x < width - 1 && checkPos(x + 1, y, '<');
		const goU = dir !== '^' && y > 0 && checkPos(x, y - 1, 'v');
		const goD = dir !== 'v' && y < height - 1 && checkPos(x, y + 1, '^');

		const moves = [];
		if (goL) moves.push([x - 1, y, '>']);
		if (goR) moves.push([x + 1, y, '<']);
		if (goU) moves.push([x, y - 1, 'v']);
		if (goD) moves.push([x, y + 1, '^']);

		moves.forEach(([x, y, slope], i) => {
			if (i === 0) addToQueue(x, y, depth + 1, pathIndex, slope);
			else {
				let newPathIndex = endCell.distances.length;
				for (let yy = 0; yy < height; ++yy) {
					for (let xx = 0; xx < width; ++xx) {
						const cell = grid[getIndex(xx, yy)];
						const d = cell.distances[pathIndex];
						if (typeof d === 'number')
							cell.distances[newPathIndex] = d;
					}
				}
				addToQueue(x, y, depth + 1, newPathIndex, slope);
			}
		});
	}

	answers[0] = Math.max(...startCell.distances);

	return answers;
};
