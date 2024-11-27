importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [null, null];

	const rotate = (grid) => {
		const rows = grid.split('/').map((row) => row.split(''));
		const size = rows.length;
		const e = size - 1;
		let temp = rows[0][0];
		rows[0][0] = rows[e][0];
		rows[e][0] = rows[e][e];
		rows[e][e] = rows[0][e];
		rows[0][e] = temp;
		if (size === 3) {
			temp = rows[1][0];
			rows[1][0] = rows[e][1];
			rows[e][1] = rows[1][e];
			rows[1][e] = rows[0][1];
			rows[0][1] = temp;
		}
		return rows.map((row) => row.join('')).join('/');
	};

	const flipX = (grid) => {
		const rows = grid.split('/').map((row) => row.split(''));
		const size = rows.length;
		const e = size - 1;
		for (let i = 0; i < size; ++i) {
			const temp = rows[i][0];
			rows[i][0] = rows[i][e];
			rows[i][e] = temp;
		}
		return rows.map((row) => row.join('')).join('/');
	};

	const flipY = (grid) => {
		const rows = grid.split('/').map((row) => row.split(''));
		rows.reverse();
		return rows.map((row) => row.join('')).join('/');
	};

	const replacements = Object.fromEntries(
		input.split('\n').flatMap((rule) => {
			const [input, output] = rule.split(' => ');

			const patterns = [input];
			for (let i = 0; i < 3; ++i) {
				patterns.push(rotate(patterns[i]));
			}

			return patterns
				.flatMap((pattern) => [pattern, flipX(pattern), flipY(pattern)])
				.map((pattern) => [pattern, output]);
		}),
	);

	const computeSize = (grid) => grid.split('/').length;

	let grid = `.#./..#/###`;

	const divide = (grid, size) => {
		const subgrids = [];
		const lines = grid.split('/');
		for (let y = 0, n = lines.length; y < n; y += size) {
			const subgrid = (subgrids[y / size] ??= []);

			for (let x = 0; x < n; x += size) {
				const cell = [];
				for (let i = 0; i < size; ++i) {
					cell.push(lines[y + i].substring(x, x + size));
				}

				subgrid.push(cell.join('/'));
			}
		}
		return subgrids;
	};

	const join = (cells) => {
		let lines = [];
		for (let y = 0; y < cells.length; ++y) {
			for (let x = 0; x < cells[y].length; ++x) {
				const cell = cells[y][x].split('/');
				const yOffset = y * cell.length;
				cell.forEach((row, i) => {
					lines[yOffset + i] ??= '';
					lines[yOffset + i] += row;
				});
			}
		}
		return lines.join('/');
	};

	const iter = () => {
		const size = computeSize(grid);
		const divideBy = size % 2 ? 3 : 2;

		const cells = divide(grid, divideBy).map((row) => {
			return row.map((cell) => replacements[cell]);
		});
		grid = join(cells);
	};

	const logPixelsOn = (grid) => {
		pixelsOn.push(grid.split('').filter((c) => c === '#').length);
	};

	const pixelsOn = [];
	logPixelsOn(grid);
	for (let i = 1; i <= 18; ++i) {
		iter();
		logPixelsOn(grid);
	}

	result[0] = pixelsOn[5];
	result[1] = pixelsOn[18];

	callback(result);
});
