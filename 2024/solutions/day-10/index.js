export const solution = (input) => {
	const grid = input.split('\n').map((line) => line.split('').map(Number));
	const GRID_W = grid[0].length;
	const GRID_H = grid.length;

	const trailheads = [];
	const peaks = [];

	for (let y = 0; y < grid.length; ++y) {
		for (let x = 0; x < grid[y].length; ++x) {
			switch (grid[y][x]) {
				//
				case 0:
					trailheads.push([x, y]);
					break;
				case 9:
					peaks.push([x, y]);
					break;
			}
		}
	}

	const search = (trailhead, track) => {
		const queue = [[...trailhead]];
		const visited = new Set();
		let score = 0;
		while (queue.length) {
			const [x, y] = queue.shift();

			if (track) {
				const key = [x, y].join('');
				if (visited.has(key)) continue;
				visited.add(key);
			}

			const height = grid[y][x];
			if (height === 9) {
				++score;
				continue;
			}

			const nextHeight = height + 1;
			if (x > 0 && grid[y][x - 1] === nextHeight) queue.push([x - 1, y]);
			if (y > 0 && grid[y - 1][x] === nextHeight) queue.push([x, y - 1]);
			if (x < GRID_W - 1 && grid[y][x + 1] === nextHeight)
				queue.push([x + 1, y]);
			if (y < GRID_H - 1 && grid[y + 1][x] === nextHeight)
				queue.push([x, y + 1]);
		}
		return score;
	};

	const answers = [true, false].map((track) => {
		return trailheads
			.map((head) => search(head, track))
			.reduce((acc, v) => acc + v, 0);
	});
	return answers;
};
