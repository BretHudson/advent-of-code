export const solution = (input) => {
	const answers = [null, null];

	const grid = input.split('\n').map((line) => line.split(''));
	const letterNumberOffset = 'a'.charCodeAt(0);

	const lowest = [];
	const start = [-1, -1];
	const target = [-1, -1];

	const GRID_W = grid[0].length;
	const GRID_H = grid.length;

	for (let y = 0; y < GRID_H; ++y) {
		for (let x = 0; x < GRID_W; ++x) {
			switch (grid[y][x]) {
				case 'S':
					start[0] = x;
					start[1] = y;
					grid[y][x] = 'a';
				case 'a':
					lowest.push([x, y]);
					break;
				case 'E':
					target[0] = x;
					target[1] = y;
					grid[y][x] = 'z';
					break;
			}
			grid[y][x] = grid[y][x].charCodeAt(0) - letterNumberOffset;
		}
	}

	const hash = (p) => p.join(',');
	const visited = new Map();

	const findPath = (start) => {
		const queue = [[start, 0]];
		while (queue.length) {
			let [pos, steps] = queue.shift();
			const key = hash(pos);

			if (visited.has(key) && visited.get(key) <= steps) continue;
			visited.set(key, steps);
			const [x, y] = pos;

			if (x === target[0] && y === target[1]) return steps;

			const nextMoves = [];
			if (x > 0) nextMoves.push([x - 1, y]);
			if (y > 0) nextMoves.push([x, y - 1]);
			if (x < GRID_W - 1) nextMoves.push([x + 1, y]);
			if (y < GRID_H - 1) nextMoves.push([x, y + 1]);

			nextMoves.forEach((move) => {
				const delta = grid[move[1]][move[0]] - grid[y][x];
				if (delta <= 1) queue.push([move, steps + 1]);
			});
		}
	};

	answers[0] = findPath(start);
	answers[1] = lowest.map(findPath).sort((a, b) => a - b)[0];

	return answers;
};
