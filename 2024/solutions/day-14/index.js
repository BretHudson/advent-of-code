export const solution = (input) => {
	const answers = [null, null];

	const GRID = [101, 103];
	const [GRID_W, GRID_H] = GRID;

	const grid = Array.from({ length: GRID_H }, () => {
		return Array.from({ length: GRID_W }, () => 0);
	});

	const robots = input.split('\n').map((line) => {
		const [p, v] = line.split(' ').map((coords) => {
			return coords
				.replaceAll(/[^\d,-]/g, '')
				.split(',')
				.map(Number);
		});
		return { initial: p, p, v };
	});

	let steps = 0;
	const step = () => {
		++steps;
		robots.forEach((robot) => {
			for (let i = 0; i < 2; ++i) {
				robot.p[i] += robot.v[i] + GRID[i];
				robot.p[i] %= GRID[i];
			}
		});

		for (let y = 0; y < GRID_H; ++y) {
			for (let x = 0; x < GRID_W; ++x) {
				grid[y][x] = 0;
			}
		}
		robots.forEach(({ p }) => {
			++grid[p[1]][p[0]];
		});

		let noOverlaps = true;
		for (let y = 0; noOverlaps && y < grid.length; ++y) {
			for (let x = 0; x < grid[y].length; ++x) {
				if (grid[y][x] > 1) {
					noOverlaps = false;
					break;
				}
			}
		}

		return !noOverlaps;
	};

	for (let i = 0; i < 100; ++i) {
		step();
	}

	const GRID_HW = Math.floor(GRID_W / 2);
	const GRID_HH = Math.floor(GRID_H / 2);
	const quadCounts = [0, 0, 0, 0];
	for (let yy = 0; yy < 2; ++yy) {
		const yStart = yy * (GRID_HH + 1);
		for (let xx = 0; xx < 2; ++xx) {
			const quad = (yy << 1) | xx;
			const xStart = xx * (GRID_HW + 1);
			for (let y = yStart; y < yStart + GRID_HH; ++y) {
				for (let x = xStart; x < xStart + GRID_HW; ++x) {
					quadCounts[quad] += grid[y][x];
				}
			}
		}
	}

	while (step());

	answers[0] = quadCounts.reduce((a, v) => a * v);
	answers[1] = steps;

	return answers;
};
