export const solution = (input) => {
	const answers = [0, null];

	const grid = input.split('\n').map((line) => {
		return line.split('');
	});

	const start = [-1, -1];
	const end = [1, 1];
	for (let y = 0; y < grid.length; ++y) {
		for (let x = 0; x < grid[y].length; ++x) {
			if (grid[y][x] === 'S') {
				start[0] = x;
				start[1] = y;
			} else if (grid[y][x] === 'E') {
				end[0] = x;
				end[1] = y;
			}
		}
	}

	const queue = [[[...end], 0]];
	const visited = new Set();
	while (queue.length) {
		const [pos, score] = queue.shift();

		const hash = pos.join(',');
		if (visited.has(hash)) continue;
		visited.add(hash);

		const [x, y] = pos;
		grid[y][x] = score;

		if (pos[0] === start[0] && pos[1] === start[1]) break;

		const next = [
			[x - 1, y],
			[x + 1, y],
			[x, y - 1],
			[x, y + 1],
		].filter(([x, y]) => grid[y][x] !== '#');
		queue.push(...next.map((pos) => [pos, score + 1]));
	}

	const computeManhatten = (dist) => {
		const points = new Set();
		for (let i = 2; i <= dist; ++i) {
			for (let x = i; x >= 2; --x) {
				points.add([x, i - x].join(','));
				points.add([-x, i - x].join(','));
				points.add([x, -(i - x)].join(','));
				points.add([-x, -(i - x)].join(','));
				points.add([i - x, x].join(','));
				points.add([i - x, -x].join(','));
				points.add([-(i - x), x].join(','));
				points.add([-(i - x), -x].join(','));
			}
		}
		return [...points].map((p) => p.split(',').map(Number));
	};

	const v2Add = (a, b) => [a[0] + b[0], a[1] + b[1]];

	const tryWithCheats = (dist) => {
		const manhatten = computeManhatten(dist);

		const checkCheats = (pos) => {
			const [x, y] = pos;
			const curScore = grid[y][x];

			return manhatten
				.map((p) => {
					const dist = Math.abs(p[0]) + Math.abs(p[1]);
					const [x, y] = v2Add(p, pos);
					const score = parseInt(grid[y]?.[x]);
					return dist + score;
				})
				.filter((score) => !Number.isNaN(score))
				.filter((score) => curScore - score >= 100).length;
		};

		let total = 0;
		const queue = [[...start]];
		const visited = new Set();
		while (queue.length) {
			const pos = queue.shift();
			if (pos[0] === end[0] && pos[1] === end[1]) break;

			const hash = pos.join(',');
			if (visited.has(hash)) continue;
			visited.add(hash);

			total += checkCheats(pos);

			const [x, y] = pos;
			const next = [
				[x - 1, y],
				[x + 1, y],
				[x, y - 1],
				[x, y + 1],
			].filter(([x, y]) => grid[y][x] !== '#');
			queue.push(...next);
		}

		return total;
	};

	answers[0] = tryWithCheats(2);
	answers[1] = tryWithCheats(20);

	return answers;
};
