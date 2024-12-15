export const solution = (input) => {
	const answers = [null, null];

	const [gridStr, inputsStr] = input.split('\n\n');

	const ICON = {
		WALL: '#',
		BOX: 'O',
		BOXL: '[',
		BOXR: ']',
		ROBOT: '@',
		EMPTY: '.',
	};

	const DELTAS = {
		'<': [-1, 0],
		'>': [1, 0],
		'^': [0, -1],
		v: [0, 1],
	};

	const inputs = inputsStr.replaceAll(/[\r\n]/g, '').split('');

	const index = input.indexOf(ICON.ROBOT);
	const newlineIndex = input.indexOf('\n');
	const robotStart = [
		index % (newlineIndex + 1),
		Math.floor(index / (newlineIndex + 1)),
	];

	const predictMotion = (replacements) => {
		const grid = gridStr
			.replace('@', '.')
			.split('\n')
			.map((line) => {
				return line.split('').flatMap((c) => {
					return replacements?.[c] ?? c;
				});
			});
		const getCell = (x, y) => grid[y][x];
		const setCell = (x, y, v) => (grid[y][x] = v);

		const robot = [...robotStart];
		robot[0] = robot[0] * (replacements ? 2 : 1);

		const moveBoxes = (x, y, delta) => {
			const nextX = x + delta[0];
			const nextY = y + delta[1];

			switch (getCell(nextX, nextY)) {
				case ICON.BOX: {
					const boxes = moveBoxes(nextX, nextY, delta);
					if (!boxes) return boxes;
					return boxes.concat([[nextX, nextY]]);
				}

				case ICON.BOXL:
				case ICON.BOXR: {
					let width = 1;
					let leftX = nextX;
					if (delta[1] !== 0) {
						width = 2;
						leftX -= getCell(nextX, nextY) === ICON.BOXR ? 1 : 0;
					}

					const pos = [];
					for (let i = 0; i < width; ++i)
						pos.push([leftX + i, nextY]);

					const boxes = pos.flatMap((p) => moveBoxes(...p, delta));

					return boxes.every(Boolean) ? boxes.concat(pos) : null;
				}

				case ICON.WALL:
					return null;
				case ICON.EMPTY:
					return [];
			}

			return false;
		};

		const move = (pos, delta) => {
			pos[0] += delta[0];
			pos[1] += delta[1];
		};

		let delta;
		for (let i = 0, n = inputs.length; i < n; ++i) {
			delta = DELTAS[inputs[i]];

			let boxes;
			switch (getCell(robot[0] + delta[0], robot[1] + delta[1])) {
				case ICON.WALL:
					break;
				case ICON.BOX:
				case ICON.BOXL:
				case ICON.BOXR:
					boxes = moveBoxes(...robot, delta);
					if (boxes) {
						const moved = new Set();
						boxes.forEach((box) => {
							const key = box.join(',');
							if (moved.has(key)) return;
							moved.add(key);
							const prev = getCell(...box);
							setCell(...box, ICON.EMPTY);
							move(box, delta);
							setCell(...box, prev);
						});
						// fall through :)
					} else break;

				default:
					move(robot, delta);
					break;
			}
		}

		let sum = 0;
		for (let y = 0; y < grid.length; ++y) {
			for (let x = 0; x < grid[y].length; ++x) {
				switch (getCell(x, y)) {
					case ICON.BOX:
					case ICON.BOXL:
						sum += 100 * y + x;
						break;
				}
			}
		}
		return sum;
	};

	answers[0] = predictMotion();
	answers[1] = predictMotion({
		[ICON.WALL]: [ICON.WALL, ICON.WALL],
		[ICON.BOX]: [ICON.BOXL, ICON.BOXR],
		[ICON.EMPTY]: [ICON.EMPTY, ICON.EMPTY],
	});

	return answers;
};
