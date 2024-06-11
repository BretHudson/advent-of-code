export const solution = (input) => {
	const answers = [null, null];

	const grid = input.split('\n').map((v) => v.split(''));

	const width = grid[0].length;
	const height = grid.length;

	const startPos = grid
		.map((line, i) => [line.indexOf('S'), i])
		.find(([x]) => x !== -1);

	grid[startPos[1]][startPos[0]] = '.';

	const setGrid = (x, y, value) => {
		if (x < 0 || y < 0 || x >= width || y >= height) return;

		if (grid[y][x] === '.') grid[y][x] = value;
	};

	setGrid(...startPos, 0);

	for (let s = 1; s <= 1310; ++s) {
		for (let y = 0; y < height; ++y) {
			for (let x = 0; x < width; ++x) {
				if (grid[y][x] === s - 1) {
					setGrid(x - 1, y, s);
					setGrid(x + 1, y, s);
					setGrid(x, y - 1, s);
					setGrid(x, y + 1, s);
				}
			}
		}
	}

	answers[0] = grid.flat().filter((v) => v % 2 === 0 && v <= 64).length;

	const maxSteps = 26501365;

	// Kudos to https://github.com/villuna/aoc23/wiki/A-Geometric-solution-to-advent-of-code-2023,-day-21 for the assist
	const evenC = grid.flat().filter((v) => v % 2 === 0 && v > 65).length;
	const oddC = grid.flat().filter((v) => v % 2 === 1 && v > 65).length;
	const evenF = grid.flat().filter((v) => v % 2 === 0).length;
	const oddF = grid.flat().filter((v) => v % 2 === 1).length;
	const n = (maxSteps - (width >> 1)) / width;

	answers[1] = [
		(n + 1) * (n + 1) * oddF,
		n * n * evenF,
		-(n + 1) * oddC,
		n * evenC,
	].reduce((acc, val) => acc + val);

	return answers;
};
