export const solution = (input) => {
	const answers = [null, null];

	const EMPTY_CELL = '#';

	const eol = input.indexOf('\n');
	const paddingLine = EMPTY_CELL.repeat(eol);

	const lines = input.split('\n');
	const grid = [paddingLine, ...lines, paddingLine].flatMap((line) => {
		return [EMPTY_CELL, ...line, EMPTY_CELL];
	});

	const originalGrid = [...grid];
	const baseGrid = grid;

	const stride = lines[0].length + 2;
	const height = lines.length + 2;

	const inBounds = (x, y) => x >= 0 && y >= 0 && x < stride && y < height;
	const getCellIndex = (x, y) => y * stride + x;
	const getCellPos = (index) => [index % stride, Math.floor(index / stride)];
	const getCell = (grid, x, y) => grid[getCellIndex(x, y)] ?? null;
	const setCell = (grid, x, y, val) => {
		grid[getCellIndex(x, y)] = val;
	};

	const CUR_TYPE = true;

	const directions = [
		[0, -1], // up
		[1, 0], // right
		[0, 1], // down
		[-1, 0], // left
	];

	const toLeft = (dir) => (dir + 4 - 1) % 4;
	const toRight = (dir) => (dir + 1) % 4;

	const getNeighbors = (pos) =>
		directions.map((offset) => v2Add(pos, offset));

	const getPerimeter = (grid, _cells) => {
		const [corner] = _cells;
		const cells = new Set(_cells.map((c) => c.join(',')));
		const startPos = v2Add(corner, [0, -1]);
		const endPos = v2Add(corner, [-1, -1]);
		const type = getCell(grid, ...corner);
		let perimeter = 0;
		let dir = 1;
		let sides = 0;
		let corners = [];

		const MOVES = {
			MOVE_FORWARD: 0,
			TURN_RIGHT: 1,
			TURN_LEFT: 2,
		};

		const queue = [];

		const getCell2 = (pos) => {
			return cells.has(pos.join(',')) ? type : undefined;
		};

		let cur = [...startPos];
		while (cur[0] !== endPos[0] || cur[1] !== endPos[1]) {
			while (queue.length) {
				const move = queue.shift();

				switch (move) {
					case MOVES.MOVE_FORWARD:
						cur = v2Add(cur, directions[dir]);
						break;
					case MOVES.TURN_RIGHT:
						++sides;
						dir = toRight(dir);
						corners.push(cur);
						break;
					case MOVES.TURN_LEFT:
						++sides;
						corners.push(cur);
						dir = toLeft(dir);
						break;
				}
			}

			const leftAdj = v2Add(cur, directions[toLeft(dir)]);
			const forwardAdj = v2Add(cur, directions[dir]);
			const rightAdj = v2Add(forwardAdj, directions[toRight(dir)]);
			const mask = [rightAdj, forwardAdj, leftAdj]
				.map(getCell2)
				.map((c) => +(c === type))
				.reduce((a, v, i) => a | (v << i), 0);

			switch (mask) {
				case 1:
				case 5:
					++perimeter;
					queue.push(MOVES.MOVE_FORWARD);
					break;
				case 0:
				case 4:
					queue.push(MOVES.MOVE_FORWARD);
					queue.push(MOVES.TURN_RIGHT);
					break;
				default:
					++perimeter;
					queue.push(MOVES.TURN_LEFT);
					break;
			}
		}

		return {
			perimeter,
			sides,
			corners,
		};
	};

	const v2Add = (a, b) => [a[0] + b[0], a[1] + b[1]];

	const floodFill = (grid, newVal, start, cond, cells) => {
		const queue = [start];
		setCell(grid, ...start, newVal);
		for (let i = 0; i < queue.length; ++i) {
			const cur = queue[i];
			cells?.push(cur);
			const neighbors = getNeighbors(cur);
			for (let p = 0; p < 4; ++p) {
				const pos = neighbors[p];
				const [x, y] = pos;

				if (inBounds(x, y) && cond(getCell(grid, x, y))) {
					setCell(grid, x, y, newVal);
					queue.push(pos);
				}
			}
		}
	};
	const _renderGrid = (grid) => {
		const lines = [];
		for (let y = 0; y < height; ++y) {
			const line = [];
			for (let x = 0; x < stride; ++x) {
				const value = getCell(grid, x, y);
				if (value) line.push(value === CUR_TYPE ? 'X' : value);
				else line.push('.');
			}
			lines.push(line.join(''));
		}
		return lines;
	};

	const renderGrids = (grid1, grid2) => {
		return;
		const lines1 = _renderGrid(grid1);
		if (grid2) {
			const lines2 = _renderGrid(grid2);
			const lines = lines1.map((line, i) =>
				[line, lines2[i]].join('   '),
			);
			console.log(lines.join('\n'));
		} else {
			console.log(lines1.join('\n'));
		}
	};

	const computePlot = (baseGrid) => {
		const startIndex = baseGrid.findIndex((v) => v && v !== '#');
		const pos = getCellPos(startIndex);
		const type = getCell(baseGrid, ...pos);

		const plot = {
			type,
			cells: [],
			holes: [],
			perimeter: 0,
			sides: 0,
		};

		const grid = [...baseGrid];

		floodFill(grid, null, pos, (val) => val === type);
		floodFill(grid, null, [0, 0], (val) => val);

		let index = 0;
		while ((index = grid.findIndex((v) => v)) > -1) {
			const pos = getCellPos(index);
			const inside = [];
			floodFill(grid, null, pos, (val) => val, inside);
			plot.holes.push(inside);
		}

		floodFill(baseGrid, EMPTY_CELL, pos, (val) => val === type, plot.cells);
		plot.area = plot.cells.length;

		return plot;
	};

	{
		console.time('full');
		console.time('compute plots');
		const plots = [];

		let left = grid.length - (stride + stride + height + height - 4);
		while (left > 0) {
			// console.time('compute plot');

			const plot = computePlot(baseGrid);
			left -= plot.area;
			plots.push(plot);

			// plots.push(computePlot(baseGrid));

			// console.timeEnd('compute plot');
		}

		console.timeEnd('compute plots');
		console.time('perimeters');

		for (let i = 0; i < plots.length; ++i) {
			// console.warn(plots[i].type);
			// console.log(plots[i]);

			const p = getPerimeter(originalGrid, plots[i].cells);

			plots[i].perimeter = p.perimeter;
			plots[i].sides = p.sides;

			const holePerms = plots[i].holes.map((hole) => {
				const pp = getPerimeter(originalGrid, hole);
				return pp;
			});
			const inner = holePerms
				.map(({ perimeter }) => perimeter)
				.reduce((a, v) => a + v, 0);
			const innerSides = holePerms
				.map(({ sides }) => sides)
				.reduce((a, v) => a + v, 0);

			plots[i].perimeter = p.perimeter + inner;
			plots[i].sides = p.sides + innerSides;
		}

		// console.table(plots);

		if (false) {
			plots.forEach(({ type, area, perimeter }) => {
				console.log(
					`A region of ${type} plants with price ${area} * ${perimeter} = ${
						area * perimeter
					}`,
				);
			});
		}

		answers[0] = plots
			.map(({ area, perimeter }) => area * perimeter)
			.reduce((a, v) => a + v, 0);

		// target = 936718
		answers[1] = plots
			.map(({ area, sides }) => area * sides)
			.reduce((a, v) => a + v, 0);

		// console.table(plots);
	}
	console.timeEnd('perimeters');
	console.timeEnd('full');

	renderGrids(baseGrid);

	return answers;
};
