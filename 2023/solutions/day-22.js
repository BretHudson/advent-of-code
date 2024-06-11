export const solution = (input) => {
	const answers = [null, null];

	const bricks = input.split('\n').map((line, i) => {
		const coords = line
			.split('~')
			.map((coord) => coord.split(',').map((v) => +v));
		const [[x1, y1, z1], [x2, y2, z2]] = coords;
		const id = String.fromCharCode(65 + i);
		return {
			id,
			x1,
			y1,
			z1,
			x2,
			y2,
			z2,
			supports: [],
			supportedBy: [],
		};
	});

	const overlap = (a, b, z = 0) => {
		return (
			// check Z first since it's the most likely to fail (early exit :))
			a.z1 - z <= b.z2 &&
			a.z2 - z >= b.z1 &&
			a.x1 <= b.x2 &&
			a.x2 >= b.x1 &&
			a.y1 <= b.y2 &&
			a.y2 >= b.y1
		);
	};

	const canFall = (brick, brickIndex, ignore = -1) => {
		const atBottom = Math.min(brick.z1, brick.z2) === 1;

		let free = true;
		for (let i = 0; free && i < bricks.length; ++i) {
			if (i === brickIndex || i === ignore) continue;
			free &&= !overlap(brick, bricks[i], 1);
		}

		return !atBottom && free;
	};

	// this is really slow, could speed up by partitioning the blocks by their Z value(s)
	let fell = true;
	while (fell) {
		fell = false;
		for (let i = 0; i < bricks.length; ++i) {
			if (canFall(bricks[i], i)) {
				--bricks[i].z1;
				--bricks[i].z2;
				fell = true;
			}
		}
	}

	// find which bricks support which other bricks
	for (let j = 0; j < bricks.length; ++j) {
		for (let i = 0; i < bricks.length; ++i) {
			if (i === j) continue;
			if (overlap(bricks[j], bricks[i], 1)) {
				// bricks[i] is supporting j
				bricks[i].supports.push(bricks[j]);
				bricks[j].supportedBy.push(bricks[i]);
			}
		}
	}

	const unsafeBricks = bricks.filter((brick) => {
		const { supports } = brick;
		return supports.some((b) => b.supportedBy.length === 1);
	});

	const chainReactions = unsafeBricks.map((brick) => {
		const queue = [];
		queue.push(brick);
		let count = 0;
		const demolished = new Set(brick.id);
		while (queue.length) {
			const { supports } = queue.shift();
			for (let i = 0; i < supports.length; ++i) {
				const s = supports[i];
				const hash = s.id;
				const belowDestroyed = s.supportedBy.every((brick) =>
					demolished.has(brick.id),
				);
				if (!belowDestroyed) continue;
				if (demolished.has(hash)) continue;
				demolished.add(hash);
				++count;
				queue.push(s);
			}
		}
		return count;
	});

	answers[0] = bricks.length - unsafeBricks.length;
	answers[1] = chainReactions.reduce((acc, val) => acc + val, 0);

	return answers;
};
