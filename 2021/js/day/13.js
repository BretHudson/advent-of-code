importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const [pointsStr, foldsStr] = input.split('\n\n');

	const points = pointsStr
		.split('\n')
		.map((line) => line.split(',').map(Number));

	const folds = foldsStr.split('\n').map((line) => {
		const [axis, coord] = line.split(' ').reverse()[0].split('=');
		return { axis, coord: +coord };
	});

	const doFold = {
		x: (points, xPos) => {
			return points.map(([x, y]) => {
				if (x > xPos) {
					const delta = xPos - x;
					return [xPos + delta, y];
				}
				return [x, y];
			});
		},
		y: (points, yPos) => {
			return points.map(([x, y]) => {
				if (y > yPos) {
					const delta = yPos - y;
					return [x, yPos + delta];
				}
				return [x, y];
			});
		},
	};

	const performFolds = (points, folds) => {
		const { axis, coord } = folds[0];
		return doFold[axis](points, coord);
	};

	const afterOneFold = performFolds(points, folds.slice(0, 1));
	const set = new Set(afterOneFold.map((p) => p.join(',')));
	result[0] = set.size;

	const finalPoints = folds.reduce((points, { axis, coord }) => {
		return doFold[axis](points, coord);
	}, points);

	const drawPoints = (points) => {
		const maxX = points.reduce((acc, [x]) => Math.max(acc, x), 0);
		const maxY = points.reduce((acc, [, y]) => Math.max(acc, y), 0);

		const lines = [];
		for (let y = 0; y <= maxY; ++y) {
			const line = [];
			for (let x = 0; x <= maxX; ++x) {
				const point = points.find(
					(point) => point[0] === x && point[1] === y,
				);
				if (point) line.push('#');
				else line.push('.');
			}
			lines.push(line.join(''));
		}
		return lines.join('\n');
	};

	const letters = {
		A: `.##.\n#..#\n#..#\n####\n#..#\n#..#`,
		B: `###.\n#..#\n###.\n#..#\n#..#\n###.`,
		C: `.##.\n#..#\n#...\n#...\n#..#\n.##.`,
		E: `####\n#...\n###.\n#...\n#...\n####`,
		F: `####\n#...\n###.\n#...\n#...\n#...`,
		G: `.##.\n#..#\n#...\n#.##\n#..#\n.###`,
		H: `#..#\n#..#\n####\n#..#\n#..#\n#..#`,
		J: `..##\n...#\n...#\n...#\n#..#\n.##.`,
		K: `#..#\n#.#.\n##..\n#.#.\n#.#.\n#..#`,
		L: `#...\n#...\n#...\n#...\n#...\n####`,
		P: `###.\n#..#\n#..#\n###.\n#...\n#...`,
		R: `###.\n#..#\n#..#\n###.\n#.#.\n#..#`,
		U: `#..#\n#..#\n#..#\n#..#\n#..#\n.##.`,
		Z: `####\n...#\n..#.\n.#..\n#...\n####`,
	};

	const code = drawPoints(finalPoints).split('\n');
	result[1] = '';
	for (let letterIndex = 0; letterIndex < 8; ++letterIndex) {
		const startX = 5 * letterIndex;
		const lines = [];
		for (let y = 0; y < 6; ++y) {
			const line = [];
			for (let x = startX, endX = x + 4; x < endX; ++x) {
				line.push(code[y][x]);
			}
			lines.push(line.join(''));
		}
		const target = lines.join('\n');
		const [letter] = Object.entries(letters).find(([k, v]) => target === v);
		result[1] += letter;
	}

	sendResult();
};
