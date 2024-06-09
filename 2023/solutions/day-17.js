export const solution = (input) => {
	const answers = [null, null];

	const grid = input.split('\n').map((v) => v.split('').map((v) => +v));

	const width = grid[0].length;
	const height = grid.length;

	const heatMap = Array.from({ length: height }, () => {
		return Array.from({ length: width }, () => Number.POSITIVE_INFINITY);
	});

	const v2add = (a, b) => a.map((v, i) => v + (b[i] ?? 0));

	const startPos = [0, 0];
	const targetPos = [width - 1, height - 1];

	const queues = new Map();
	const visited = new Set();

	let foundEnd = false;

	heatMap[0][0] = 0;

	const addToQueue = (pos, dir, steps, heatLost) => {
		const nextPos = v2add(pos, dir);
		const [x, y] = nextPos;

		if (x < 0 || y < 0 || x >= width || y >= height) return;

		const newHeatLost = heatLost + grid[y][x];
		heatMap[y][x] = Math.min(heatMap[y][x], newHeatLost);

		if (x === targetPos[0] && y === targetPos[1]) {
			foundEnd = true;
			return;
		}

		const state = [nextPos, dir, steps];

		const hash = state.join(',');
		if (visited.has(hash)) return;
		visited.add(hash);

		const newQueue = queues.get(newHeatLost) ?? [];
		newQueue.push(state);
		queues.set(newHeatLost, newQueue);
	};

	addToQueue(startPos, [1, 0], 1, 0);
	addToQueue(startPos, [0, 1], 1, 0);

	while (!foundEnd) {
		const heatLost = [...queues.keys()].sort((a, b) => a - b)[0];
		const queue = queues.get(heatLost);
		queues.delete(heatLost);

		while (queue?.length) {
			const [curPos, curDir, steps] = queue.shift();

			const [xVel, yVel] = curDir;
			addToQueue(curPos, [-yVel, xVel], 1, heatLost);
			addToQueue(curPos, [yVel, -xVel], 1, heatLost);

			if (steps < 3) addToQueue(curPos, curDir, steps + 1, heatLost);
		}
	}

	answers[0] = heatMap[targetPos[1]][targetPos[0]];

	return answers;
};
