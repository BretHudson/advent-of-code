export const solution = (input) => {
	const answers = [null, null];

	const grid = input.split('\n').map((v) => v.split(''));

	const width = grid[0].length;
	const height = grid.length;

	const directions = [
		[0, -1],
		[-1, 0],
		[0, 1],
		[1, 0],
	];

	const slide = (XX, YY) => {
		let dir = XX + YY;

		for (let i = 0; i < width; ++i) {
			let firstEmpty = 0;
			let slide = 0;
			const d = (dir + 1) / 2;
			const start = d * (height - 1);
			const end = d * -1 + (1 - d) * height;
			for (let j = start; j !== end; j -= dir) {
				const x = YY ? i : j;
				const y = YY ? j : i;
				switch (grid[y][x]) {
					case 'O':
						if (slide) {
							grid[y + slide * YY][x + slide * XX] = 'O';
							grid[y][x] = '.';
						}
						break;
					case '.':
						++slide;
						break;
					case '#':
						firstEmpty = y + YY;
						slide = 0;
						break;
				}
			}
		}
	};

	const cycle = (skip = 0) => {
		directions.slice(skip).forEach((dir) => {
			slide(...dir);
		});
	};

	const computeLoad = () => {
		let load = 0;
		for (let y = 0; y < height; ++y) {
			const score = height - y;
			for (let x = 0; x < width; ++x) {
				if (grid[y][x] === 'O') {
					load += score;
				}
			}
		}
		return load;
	};

	const hashes = new Map();
	const hashGrid = (grid, i) => {
		const hash = grid.map((line) => line.join('')).join('\n');
		if (hashes.has(hash)) {
			console.log('hit', i);
			return hashes.get(hash);
		}
		hashes.set(hash, i);
		return false;
	};

	slide(0, -1);
	answers[0] = computeLoad();

	cycle(1);
	hashGrid(grid);
	let cycleIndex = 1;
	let cycleCount = 0;
	const numCycles = 1000000000;
	for (; cycleIndex < numCycles; ++cycleIndex) {
		cycle();
		if (hashGrid(grid, cycleIndex)) {
			cycleCount = cycleIndex - hashGrid(grid, cycleIndex);
			break;
		}
	}

	const remaining = ((numCycles - cycleIndex) % cycleCount) - 1;
	for (let i = 0; i < remaining; ++i) {
		cycle();
	}

	answers[1] = computeLoad();

	return answers;
};
