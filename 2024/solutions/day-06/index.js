export const solution = (input) => {
	const answers = [null, null];

	let guardPos;
	const grid = input.split('\n').map((line) => line.split(''));

	for (let y = 0; !guardPos && y < grid.length; ++y) {
		for (let x = 0; x < grid[y].length; ++x) {
			if (grid[y][x] === '^') {
				guardPos = [x, y];
				break;
			}
		}
	}

	const directions = [
		[0, -1], // up
		[1, 0], // right
		[0, 1], // down
		[-1, 0], // left
	];

	const v2add = (a, b) => a.map((v, i) => v + (b[i] ?? 0));
	const getCell = ([x, y]) => grid[y]?.[x];
	const setCell = ([x, y], v) => {
		if (getCell([x, y])) {
			grid[y][x] = v;
		}
	};

	const moveForward = (queue, visited) => {
		const curPos = queue.shift();
		visited?.push(curPos);

		const nextPos = v2add(curPos, directions[curDir]);
		const nextCell = getCell(nextPos);
		switch (nextCell) {
			case '#':
				queue.push(curPos);
				curDir = (curDir + 1) % 4;
				break;
			case undefined:
				return true;
			default:
				queue.push(nextPos);
				break;
		}
	};

	let curDir = 0;
	const queue = [guardPos];
	const visited = [];
	for (; queue.length; moveForward(queue, visited));

	const uniqueVisitedSet = new Set(visited.map((v) => v.join(',')));
	const uniqueVisited = [...uniqueVisitedSet].map((v) =>
		v.split(',').map(Number),
	);
	const loops = [];
	for (let i = 1; i < uniqueVisited.length; ++i) {
		const nextPos = uniqueVisited[i];
		if (getCell(nextPos) === '#') continue;

		curDir = 0;
		const queue = [guardPos];

		let inLoop = true;
		setCell(nextPos, '#');
		for (let j = 0; j < 6500; ++j) {
			if (moveForward(queue)) {
				inLoop = false;
				break;
			}
		}

		if (inLoop) loops.push(nextPos);

		setCell(nextPos, '.');
	}

	answers[0] = uniqueVisitedSet.size;
	answers[1] = new Set(loops.map((v) => v.join(','))).size;

	return answers;
};
