importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const directions = input.split('\n').map((line) => {
		return line
			.split('')
			.map((v, i, arr) =>
				['s', 'n'].includes(v) ? `${v}${arr[i + 1]}` : v,
			)
			.filter((_, i, arr) => !i || arr[i - 1].length === 1);
	});

	const tiles = {};

	const offsets = {
		e: [0, 1, -1],
		se: [1, 0, -1],
		sw: [1, -1, 0],
		w: [0, -1, 1],
		nw: [-1, 0, 1],
		ne: [-1, 1, 0],
	};
	const cardinals = Object.keys(offsets);

	const move = (pos, dir) => offsets[dir].map((v, i) => v + pos[i]);

	directions.forEach((direction) => {
		const key = direction.reduce(move, [0, 0, 0]).join(',');
		if (tiles[key]) delete tiles[key];
		else tiles[key] = true;
	});

	result[0] = Object.entries(tiles).length;

	console.time('fuck');
	for (let i = 0; i < 100; ++i) {
		const whiteTiles = {};

		Object.keys(tiles)
			.filter((k) => {
				const pos = k.split(',').map(Number);
				const neighbors = cardinals
					.map(move.bind(0, pos))
					.map((v) => v.join(','));
				neighbors.forEach((k) => {
					if (tiles[k]) return;
					whiteTiles[k] ??= 0;
					++whiteTiles[k];
				});
				const blackNeighbors = neighbors.filter((n) => tiles[n]);
				return blackNeighbors.length === 0 || blackNeighbors.length > 2;
			})
			.forEach((k) => delete tiles[k]);

		Object.entries(whiteTiles)
			.filter(([, v]) => v === 2)
			.forEach(([k]) => (tiles[k] = true));
	}
	console.timeEnd('fuck');

	result[1] = Object.values(tiles).length;

	sendResult();
};
