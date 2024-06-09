export const solution = (input) => {
	const answers = [null, null];

	const digPlan = input.split('\n').map((v) => {
		const { direction, meters, color } = v.match(
			/(?<direction>\w) (?<meters>\d+) \(#(?<color>\w{6})\)/,
		).groups;

		return { direction, meters: +meters, color };
	});

	let xMin = 0,
		xMax = 0,
		yMin = 0,
		yMax = 0;

	let x = 0,
		y = 0;
	digPlan.forEach(({ direction, meters }) => {
		switch (direction) {
			case 'L':
				x -= meters;
				break;
			case 'R':
				x += meters;
				break;
			case 'U':
				y -= meters;
				break;
			case 'D':
				y += meters;
				break;
		}

		xMin = Math.min(x, xMin);
		xMax = Math.max(x, xMax);
		yMin = Math.min(y, yMin);
		yMax = Math.max(y, yMax);
	});

	// width & height have built in padding (2) for the flood fill
	const width = xMax - xMin + 1 + 2;
	const height = yMax - yMin + 1 + 2;

	const grid = Array.from({ length: height }, () => {
		return Array.from({ length: width }, () => '.');
	});

	// adjust to account for padding
	x = -xMin + 1;
	y = -yMin + 1;
	digPlan.forEach(({ direction, meters }) => {
		for (let i = 0; i < meters; ++i) {
			switch (direction) {
				case 'L':
					--x;
					break;
				case 'R':
					++x;
					break;
				case 'U':
					--y;
					break;
				case 'D':
					++y;
					break;
			}
			grid[y][x] = '#';
		}
	});

	const queue = [[1, 0]];
	while (queue.length) {
		const curPos = queue.shift();
		const [x, y] = curPos;

		if (grid[y][x] === 'x' || grid[y][x] === '#') continue;

		grid[y][x] = 'x';
		if (x > 0) queue.push([x - 1, y]);
		if (y > 0) queue.push([x, y - 1]);
		if (x < width - 1) queue.push([x + 1, y]);
		if (y < height - 1) queue.push([x, y + 1]);
	}

	answers[0] = grid.flat().filter((v) => v === '#' || v === '.').length;

	return answers;
};
