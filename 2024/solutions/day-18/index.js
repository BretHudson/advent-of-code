export const solution = (input) => {
	const answers = [null, null];

	const grid = input.split('\n').map((line) => line.split(',').map(Number));

	const cur = [0, 0];
	const target = [70, 70];

	const allHashes = grid.map((pos) => pos.join(','));

	const targetHash = target.join(',');

	const search = (bytes) => {
		const hashes = allHashes.slice(0, bytes);
		const queue = [{ pos: [...cur], depth: 0 }];
		const visited = new Set();
		while (queue.length) {
			const { pos, depth } = queue.shift();
			const hash = pos.join(',');
			if (hash === targetHash) return depth;

			if (visited.has(hash)) continue;
			visited.add(hash);

			const [x, y] = pos;
			let nextPos = [];
			if (x > 0) nextPos.push([x - 1, y]);
			if (y > 0) nextPos.push([x, y - 1]);
			if (x < target[0]) nextPos.push([x + 1, y]);
			if (y < target[1]) nextPos.push([x, y + 1]);

			nextPos = nextPos
				.filter((pos) => !hashes.includes(pos.join(',')))
				.map((pos) => ({ pos, depth: depth + 1 }));
			queue.push(...nextPos);
		}

		return -1;
	};

	answers[0] = search(1024);

	let min = 1024 + 1;
	let max = grid.length;

	while (min + 1 < max) {
		let mid = min + Math.floor((max - min) / 2);
		if (search(mid) === -1) max = mid;
		else min = mid;
	}

	answers[1] = grid[min].join(',');

	return answers;
};
