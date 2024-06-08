export const solution = (input) => {
	const answers = [null, null];

	input = input.replaceAll('I', '.').replaceAll('O', '.');

	const grid2d = input.split('\n').map((line) => line.split(''));

	const width = grid2d[0].length;
	const height = grid2d.length;

	const grid = grid2d.flat(); //.map((v) => (v !== '.' ? v : 0));

	const getPos = (i) => [i % width, Math.floor(i / width)];
	const getIndex = ([x, y]) => y * width + x;

	const startIndex = grid.indexOf('S');
	const startPos = getPos(startIndex);

	const queue = [[0, startPos]];
	const visited = new Map();
	while (queue.length) {
		const [d, curPos] = queue.shift();
		const hash = curPos.join(',');

		if (visited.has(hash)) continue;
		visited.set(hash, d);

		const left = [curPos[0] - 1, curPos[1]];
		const right = [curPos[0] + 1, curPos[1]];
		const up = [curPos[0], curPos[1] - 1];
		const down = [curPos[0], curPos[1] + 1];
		switch (grid[getIndex(curPos)]) {
			case 'S':
				let l = false,
					r = false,
					u = false,
					v = false; // down
				if (['-', 'L', 'F'].indexOf(grid[getIndex(left)]) > -1) {
					l = true;
					queue.push([d + 1, left]);
				}
				if (['-', 'J', '7'].indexOf(grid[getIndex(right)]) > -1) {
					r = true;
					queue.push([d + 1, right]);
				}
				if (['-', 'F', '7'].indexOf(grid[getIndex(up)]) > -1) {
					u = true;
					queue.push([d + 1, up]);
				}
				if (['|', 'L', 'J'].indexOf(grid[getIndex(down)]) > -1) {
					v = true;
					queue.push([d + 1, down]);
				}
				if (l && r) grid[getIndex(curPos)] = '-';
				else if (u && r) grid[getIndex(curPos)] = 'L';
				else if (v && r) grid[getIndex(curPos)] = 'F';
				else if (u && l) grid[getIndex(curPos)] = 'J';
				else if (v && l) grid[getIndex(curPos)] = '7';
				else if (v && u) grid[getIndex(curPos)] = '|';
				break;
			case '|':
				queue.push([d + 1, up], [d + 1, down]);
				break;
			case '-':
				queue.push([d + 1, left], [d + 1, right]);
				break;
			case 'L':
				queue.push([d + 1, up], [d + 1, right]);
				break;
			case 'J':
				queue.push([d + 1, left], [d + 1, up]);
				break;
			case '7':
				queue.push([d + 1, left], [d + 1, down]);
				break;
			case 'F':
				queue.push([d + 1, right], [d + 1, down]);
				break;
			case '.':
				console.error('.');
				break;
		}
	}

	answers[0] = [...visited.values()].sort((a, b) => b - a)[0];

	// remove any element in the grid that isn't in the visited map
	for (let y = 0; y < height; ++y) {
		for (let x = 0; x < width; ++x) {
			if (!visited.has([x, y].join(','))) grid[getIndex([x, y])] = '.';
		}
	}

	// pad the grid
	const paddedGrid = [];
	const paddedW = width + 2;
	const paddedH = height + 2;

	const emptyLine = Array.from({ length: paddedW }, () => '.');
	paddedGrid.push([...emptyLine]);
	for (let y = 0; y < height; ++y) {
		const s = y * width;
		paddedGrid.push(['.', ...grid.slice(s, s + width), '.']);
	}
	paddedGrid.push([...emptyLine]);

	// expand the grid
	const expandedW = paddedW * 2 - 1;
	const expandedH = paddedH * 2 - 1;
	const expanded = Array.from({ length: expandedH }, () => {
		return Array.from({ length: expandedW }, () => '.');
	});

	for (let y = 0; y < paddedH; ++y) {
		for (let x = 0; x < paddedW; ++x) {
			const value = paddedGrid[y][x];
			expanded[y * 2][x * 2] = value;
			switch (value) {
				case '-':
					expanded[y * 2][x * 2 - 1] = '-';
					expanded[y * 2][x * 2 + 1] = '-';
					break;
				case '|':
					expanded[y * 2 - 1][x * 2] = '|';
					expanded[y * 2 + 1][x * 2] = '|';
					break;
				case 'F':
					expanded[y * 2 + 1][x * 2] = '|';
					expanded[y * 2][x * 2 + 1] = '-';
					break;
				case '7':
					expanded[y * 2 + 1][x * 2] = '|';
					break;
				case 'L':
					expanded[y * 2][x * 2 + 1] = '-';
					break;
			}
		}
	}

	const floodQueue = [[0, 0]];
	const floodVisited = new Set();
	while (floodQueue.length) {
		const curPos = floodQueue.shift();
		const hash = curPos.join(',');

		if (floodVisited.has(hash)) continue;
		floodVisited.add(hash);

		const [x, y] = curPos;
		if (expanded[y][x] !== '.') continue;

		expanded[y][x] = 0;

		// left, right, up, down
		if (x > 0) floodQueue.push([x - 1, y]);
		if (y > 0) floodQueue.push([x, y - 1]);
		if (x < expandedW - 1) floodQueue.push([x + 1, y]);
		if (y < expandedH - 1) floodQueue.push([x, y + 1]);
	}

	let condensed;
	{
		const newW = paddedW;
		const newH = paddedH;
		condensed = Array.from({ length: newH }, () => {
			return Array.from({ length: newW }, () => '.');
		});

		for (let y = 0; y < paddedH; ++y) {
			let str = '';
			for (let x = 0; x < paddedW; ++x) {
				const value = expanded[y * 2][x * 2];
				condensed[y][x] = value;
				str += value;
			}
		}
	}

	answers[1] = condensed.flat().filter((v) => v === '.').length;

	return answers;
};
