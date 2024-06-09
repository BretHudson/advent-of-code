export const solution = (input) => {
	const answers = [null, null];

	const grid = input.split('\n').map((v) => v.split('').map((v) => +v));

	const width = grid[0].length;
	const height = grid.length;

	const v2add = (a, b) => a.map((v, i) => v + (b[i] ?? 0));

	const startPos = [0, 0];
	const targetPos = [width - 1, height - 1];

	const find = (turnLimit, maxStraight) => {
		const heatMap = Array.from({ length: height }, () => {
			return Array.from(
				{ length: width },
				() => Number.POSITIVE_INFINITY,
			);
		});

		const queues = new Map();
		const visited = new Set();

		let foundEnd = false;

		const addToQueue = (pos, dir, steps, heatLost) => {
			const nextPos = v2add(pos, dir);
			const [x, y] = nextPos;

			if (x < 0 || y < 0 || x >= width || y >= height) return;

			const newHeatLost = heatLost + grid[y][x];
			heatMap[y][x] = newHeatLost;

			if (
				x === targetPos[0] &&
				y === targetPos[1] &&
				steps >= turnLimit
			) {
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

				if (steps >= turnLimit) {
					addToQueue(curPos, [-yVel, xVel], 1, heatLost);
					addToQueue(curPos, [yVel, -xVel], 1, heatLost);
				}

				if (steps < maxStraight)
					addToQueue(curPos, curDir, steps + 1, heatLost);
			}
		}

		return heatMap[targetPos[1]][targetPos[0]];
	};

	answers[0] = find(0, 3);
	answers[1] = find(4, 10);

	return answers;
};
