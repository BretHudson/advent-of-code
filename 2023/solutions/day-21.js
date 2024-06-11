export const solution = (input) => {
	const answers = [null, null];

	const grid = input.split('\n').map((v) => v.split(''));

	const width = grid[0].length;
	const height = grid.length;

	const startPos = grid
		.map((line, i) => [line.indexOf('S'), i])
		.find(([x]) => x !== -1);

	const EVEN = 0;
	const ODD = 1;

	grid[startPos[1]][startPos[0]] = '.';

	const setGrid = (x, y, value) => {
		if (x < 0 || y < 0 || x >= width || y >= height) return;

		if (grid[y][x] === '.') grid[y][x] = value;
	};

	setGrid(...startPos, EVEN);

	for (let s = 1; s <= 64; ++s) {
		const last = s % 2 ? EVEN : ODD;
		const next = s % 2 ? ODD : EVEN;
		for (let y = 0; y < height; ++y) {
			for (let x = 0; x < width; ++x) {
				if (grid[y][x] === last) {
					setGrid(x - 1, y, next);
					setGrid(x + 1, y, next);
					setGrid(x, y - 1, next);
					setGrid(x, y + 1, next);
				}
			}
		}
	}

	answers[0] = grid.flat().filter((v) => v === 0).length;

	return answers;
};
