export const solution = (input) => {
	const answers = [null, null];

	const directions = input.split('\n').map((v) => {
		const [a, b] = v.split(' ');
		return [a, +b];
	});

	const createRope = (length) => Array.from({ length }, () => [0, 0]);

	const rope2 = createRope(2);
	const rope10 = createRope(10);

	const dirVecs = new Map();
	dirVecs.set('L', [-1, 0]);
	dirVecs.set('R', [1, 0]);
	dirVecs.set('U', [0, -1]);
	dirVecs.set('D', [0, 1]);

	const move = (pos, vec) => {
		pos[0] += vec[0];
		pos[1] += vec[1];
	};

	const execute = (rope) => {
		const visited = new Set();
		const knotCount = rope.length;
		for (let i = 0; i < directions.length; ++i) {
			const [dir, steps] = directions[i];
			const moveVec = dirVecs.get(dir);

			for (let step = 0; step < steps; ++step) {
				move(rope[0], moveVec);

				for (let knot = 1; knot < knotCount; ++knot) {
					const leader = rope[knot - 1];
					const follower = rope[knot];
					const delta = [
						leader[0] - follower[0],
						leader[1] - follower[1],
					];

					if (Math.abs(delta[0]) > 1 || Math.abs(delta[1]) > 1) {
						move(follower, delta.map(Math.sign));
					}
				}

				visited.add(rope[knotCount - 1].join(','));
			}
		}

		return visited.size;
	};

	answers[0] = execute(rope2);
	answers[1] = execute(rope10);

	return answers;
};
