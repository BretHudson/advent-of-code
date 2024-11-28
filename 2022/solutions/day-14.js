export const solution = (input) => {
	const answers = [null, null];

	const paths = input.split('\n').map((line) => {
		return line.split(' -> ').map((str) => {
			return str.split(',').map(Number);
		});
	});

	const minMax = paths.map((path) => {
		const xRange = path.map(([v]) => v);
		const yRange = path.map(([_, v]) => v);
		return {
			xMin: Math.min(...xRange),
			xMax: Math.max(...xRange),
			yMax: Math.max(...yRange),
		};
	});

	const [xMin, xMax, yMax] = ['xMin', 'xMax', 'yMax'].map((key) => {
		const xMins = minMax.map((ranges) => ranges[key]);
		return Math[key.substring(1).toLowerCase()](...xMins);
	});

	const gridW = xMax + xMin + 1;
	let gridH = yMax + 1;

	const grid = Array.from({ length: gridH }, () => {
		return Array.from({ length: gridW }, () => '.');
	});

	const getCell = (x, y) => grid[y][x];
	const setCell = (x, y, val) => (grid[y][x] = val);

	paths.forEach((path) => {
		for (let i = 0; i < path.length - 1; ++i) {
			const [start, end] = path.slice(i);
			const coordIndex = +(start[0] === end[0]);
			const a = start[coordIndex];
			const b = end[coordIndex];
			const delta = Math.sign(b - a);
			for (let coord = a; coord !== b + delta; coord += delta) {
				const newPos = [...start];
				newPos[coordIndex] = coord;
				setCell(...newPos, '#');
			}
		}
	});

	const spout = [500, 0];

	const execute = (i = 0) => {
		for (; true; ++i) {
			const sand = [...spout];

			let settled = false;
			while (true) {
				if (sand[1] >= gridH - 1 || getCell(...spout) === 'o') return i;

				if (getCell(sand[0], sand[1] + 1) === '.') {
					++sand[1];
				} else if (getCell(sand[0] - 1, sand[1] + 1) === '.') {
					--sand[0];
					++sand[1];
				} else if (getCell(sand[0] + 1, sand[1] + 1) === '.') {
					++sand[0];
					++sand[1];
				} else {
					settled = true;
					break;
				}
			}

			if (settled) setCell(...sand, 'o');
		}
	};

	answers[0] = execute();

	gridH += 2;
	grid.push(grid[0].map(() => '.'));
	grid.push(grid[0].map(() => '#'));
	answers[1] = execute(answers[0]);

	return answers;
};
