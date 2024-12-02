importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const grid = input.split('\n').map((line, y) =>
		line.split('').map((v, x) => ({
			pos: [x, y],
			coord: [x, y].join(','),
			power: Number(v),
			flashed: false,
		})),
	);
	const allOctopi = grid.flat();

	const offsets = [
		[-1, -1],
		[-1, 0],
		[-1, 1],
		[0, 1],
		[1, 1],
		[1, 0],
		[1, -1],
		[0, -1],
	];

	const getNeighbors = (octopus) => {
		return offsets
			.map((offset) => offset.map((v, i) => v + octopus.pos[i]))
			.filter((coord) => {
				return (
					coord[0] >= 0 &&
					coord[1] >= 0 &&
					coord[0] < grid[0].length &&
					coord[1] < grid.length
				);
			})
			.map((coord) => grid[coord[1]][coord[0]]);
	};

	const increaseOctopi = (octopi) => {
		const flashed = [];
		octopi.forEach((octopus) => {
			// an octopus can show up in the list more than once, so `flashed`
			// could change between `.forEach()` iterations
			if (octopus.flashed) return;

			if (++octopus.power > 9) {
				octopus.flashed = true;
				flashed.push(octopus);
			}
		});
		return flashed;
	};

	const step = () => {
		let flashed = increaseOctopi(allOctopi);
		while (flashed.length) {
			const neighbors = flashed.flatMap(getNeighbors);
			flashed = increaseOctopi(neighbors);
		}
		const allFlashed = allOctopi.filter((octopus) => octopus.flashed);
		allFlashed.forEach((octopus) => {
			octopus.flashed = false;
			octopus.power = 0;
		});
		return allFlashed.length;
	};

	let flashes = 0;
	for (let i = 0; i < 100; ++i) {
		flashes += step();
	}
	result[0] = flashes;

	for (let i = 101; i < 1e5; ++i) {
		const stepFlashes = step();
		if (stepFlashes === 100) {
			result[1] = i;
			break;
		}
	}

	sendResult();
};
