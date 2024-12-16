export const solution = (input) => {
	const answers = [null, null];

	const grid = input.split('\n').map((line) => line.split(''));

	const [startPos, endPos] = ['S', 'E'].map((c) => {
		const stride = grid[0].length + 1;
		const index = input.indexOf(c);
		return [index % stride, Math.floor(index / stride)];
	});

	const DIR = { U: 0, R: 1, D: 2, L: 3 };
	const OFFSET = {
		[DIR.U]: [0, -1],
		[DIR.R]: [1, 0],
		[DIR.D]: [0, 1],
		[DIR.L]: [-1, 0],
	};

	const v2Add = (a, b) => [a[0] + b[0], a[1] + b[1]];
	const rotate = (dir, r) => (dir + 4 + r) % 4;

	const queue = [[[...startPos], DIR.R, 0, []]];
	const scores = new Map();
	const paths = [];
	console.time('path');
	while (queue.length) {
		const [pos, dir, score, path] = queue.shift();

		const key = pos.join(',');
		if (scores.has(key) && scores.get(key) < score - 1000) continue;
		scores.set(key, score);

		path.push(key);
		if (pos[0] === endPos[0] && pos[1] === endPos[1]) {
			paths.push([path, score]);
			continue;
		}

		const forward = v2Add(pos, OFFSET[dir]);
		if (grid[forward[1]][forward[0]] !== '#')
			queue.push([forward, dir, score + 1, path]);

		const left = v2Add(pos, OFFSET[rotate(dir, -1)]);
		if (grid[left[1]][left[0]] !== '#')
			queue.push([left, rotate(dir, -1), score + 1001, path.slice(0)]);

		const right = v2Add(pos, OFFSET[rotate(dir, 1)]);
		if (grid[right[1]][right[0]] !== '#')
			queue.push([right, rotate(dir, 1), score + 1001, path.slice(0)]);
	}
	console.timeEnd('path');

	answers[0] = Math.min(...paths.map(([_, score]) => score));

	const bestSpots = paths
		.filter(([_, score]) => score === answers[0])
		.flatMap(([path]) => path);
	answers[1] = new Set(bestSpots).size;

	return answers;
};
