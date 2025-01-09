export const solution = (input) => {
	const answers = [null, null];

	const jets = input.split('');
	const rocks = [];

	const GRID_W = 7;
	const shapes = [
		'####',
		'.#.\n###\n.#.',
		'..#\n..#\n###',
		'#\n#\n#\n#',
		'##\n##',
	]
		.map((v) => v.split('\n'))
		.map((lines) => lines.map((line) => line.split('')).reverse());

	const pointInRect = (x, y, rect) => {
		return (
			x >= rect.x &&
			x < rect.x + rect.w &&
			y >= rect.y &&
			y < rect.y + rect.h
		);
	};

	const overlap = (a, b) => {
		if (
			a.x + a.w > b.x &&
			a.y + a.h > b.y &&
			a.x < b.x + b.w &&
			a.y < b.y + b.h
		) {
			const dX = b.x - a.x;
			const dY = b.y - a.y;
			for (let y = 0; y < a.h; ++y) {
				for (let x = 0; x < a.w; ++x) {
					if (!pointInRect(a.x + x, a.y + y, b)) continue;

					const aShape = a.shape[y][x];
					const bShape = b.shape[y - dY][x - dX];
					if (bShape === '#' && aShape === bShape) return true;
				}
			}
		}
		return false;
	};

	const move = (rock, x, y) => {
		const prevX = rock.x;
		const prevY = rock.y;
		rock.x += x;
		rock.y += y;
		if (
			rock.x < 0 ||
			rock.x > GRID_W - rock.w ||
			rock.y < 0 ||
			rocks.some((other) => overlap(rock, other))
		) {
			rock.x = prevX;
			rock.y = prevY;
			return false;
		}
		return true;
	};

	const execute = (numRocksToDrop) => {
		const moves = [];
		const moveMap = new Map();

		let index = 0;
		let topY = 0;
		let curRock;
		let rockIndex = 0;
		let jump = 0;
		for (; rockIndex < numRocksToDrop; ++rockIndex) {
			const shapeIndex = rockIndex % shapes.length;
			const hash = [shapeIndex, index].join(',');
			const shape = shapes[shapeIndex];
			curRock = {
				shape,
				x: 2,
				y: topY + 3,
				w: shape[0].length,
				h: shape.length,
			};

			do {
				const curInput = jets[index++];
				index %= jets.length;
				move(curRock, curInput === '>' ? 1 : -1, 0);
			} while (move(curRock, 0, -1));

			topY = Math.max(topY, curRock.y + curRock.h);

			if (jump === 0 && moveMap.has(hash)) {
				const prev = moveMap.get(hash);
				const rocksPerCycle = rockIndex - prev.rockIndex;
				const rocksLeft = numRocksToDrop - rockIndex;
				const cycles = Math.floor(rocksLeft / rocksPerCycle);
				jump = (topY - prev.topY) * cycles;
				rockIndex += rocksPerCycle * cycles;
			}

			if (rockIndex > jets.length * shapes.length)
				moveMap.set(hash, { rockIndex, topY });

			moves.push([hash, topY]);
			rocks.unshift(curRock);
			if (rocks.length > 50) rocks.pop();
			curRock = null;
		}

		return jump + topY;
	};

	answers[0] = execute(2022);
	answers[1] = execute(1e12);
	return answers;
};
