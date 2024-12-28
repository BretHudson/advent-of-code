importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const initialState = input
		.split('\n')
		.flatMap((line, y) =>
			line.split('').map((v, x) => v === '#' && [x, y, 0, 0].join(',')),
		)
		.filter(Boolean);

	const deltas = [-1, 0, 1];
	const offsets3d = deltas.flatMap((z) => {
		return deltas.flatMap((y) => {
			return deltas
				.map((x) => ((x | y | z) !== 0 ? [x, y, z, 0] : undefined))
				.filter(Boolean);
		});
	});
	const offsets4d = deltas.flatMap((w) => {
		return deltas.flatMap((z) => {
			return deltas.flatMap((y) => {
				return deltas
					.map((x) =>
						(x | y | z | w) !== 0 ? [x, y, z, w] : undefined,
					)
					.filter(Boolean);
			});
		});
	});

	const doCycle = (state, offsets) => {
		const queue = [...state];
		const visited = new Set(queue);

		const newActive = [];
		while (queue.length) {
			const cubeKey = queue.shift();
			const pos = cubeKey.split(',').map(Number);

			let active = state.has(cubeKey);

			let activeNeighbors = 0;
			for (
				let i = 0;
				(active || activeNeighbors < 4) && i < offsets.length;
				++i
			) {
				const key = [
					pos[0] + offsets[i][0],
					pos[1] + offsets[i][1],
					pos[2] + offsets[i][2],
					pos[3] + offsets[i][3],
				].join(',');

				if (state.has(key)) {
					++activeNeighbors;
				} else if (active && !visited.has(key)) {
					visited.add(key);
					queue.push(key);
				}
			}

			if (activeNeighbors === 3 || (active && activeNeighbors === 2)) {
				newActive.push(cubeKey);
			}
		}

		state.clear();
		newActive.forEach((active) => state.add(active));
	};

	const state3d = new Set(initialState);
	const state4d = new Set(initialState);
	for (let i = 0; i < 6; ++i) {
		doCycle(state3d, offsets3d);
		doCycle(state4d, offsets4d);
	}

	result[0] = state3d.size;
	result[1] = state4d.size;

	sendResult();
};
