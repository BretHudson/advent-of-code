export const solution = (input) => {
	const answers = [null, null];

	const grid2d = input.split('\n').map((line) => line.split(''));

	const width = grid2d[0].length;
	const height = grid2d.length;

	const grid = grid2d.flat();

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
				if (['-', 'L', 'F'].indexOf(grid[getIndex(left)]) > -1)
					queue.push([d + 1, left]);
				if (['-', 'J', '7'].indexOf(grid[getIndex(right)]) > -1)
					queue.push([d + 1, right]);
				if (['-', 'F', '7'].indexOf(grid[getIndex(up)]) > -1)
					queue.push([d + 1, up]);
				if (['|', 'L', 'J'].indexOf(grid[getIndex(down)]) > -1)
					queue.push([d + 1, down]);
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

	return answers;
};
