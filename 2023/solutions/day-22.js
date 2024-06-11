export const solution = (input) => {
	const answers = [null, null];

	const bricks = input.split('\n').map((line, i) => {
		const coords = line
			.split('~')
			.map((coord) => coord.split(',').map((v) => +v));
		const [[x1, y1, z1], [x2, y2, z2]] = coords;
		const id = String.fromCharCode(65 + i);
		return { id, x1, y1, z1, x2, y2, z2 };
	});

	const overlap = (a, b, z = 0) => {
		return [
			a.x1 <= b.x2,
			a.x2 >= b.x1,
			a.y1 <= b.y2,
			a.y2 >= b.y1,
			a.z1 - z <= b.z2,
			a.z2 - z >= b.z1,
		].reduce((acc, val) => acc && val, true);
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

	const fall = (brick) => {
		--brick.z1;
		--brick.z2;
	};

	let fell = true;
	while (fell) {
		fell = false;
		for (let i = 0; i < bricks.length; ++i) {
			if (canFall(bricks[i], i)) {
				fall(bricks[i]);
				fell = true;
				bricks[i];
			}
		}
	}

	let canDisintegrate = 0;
	for (let skip = 0; skip < bricks.length; ++skip) {
		let fall = false;
		for (let i = 0; i < bricks.length; ++i) {
			fall ||= canFall(bricks[i], i, skip);
		}
		if (!fall) ++canDisintegrate;
	}

	answers[0] = canDisintegrate;

	return answers;
};
