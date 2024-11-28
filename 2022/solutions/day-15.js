export const solution = (input) => {
	const answers = [null, null];

	const regex =
		/Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/g;
	let matches;

	const sensors = [];
	while ((matches = regex.exec(input))) {
		const [_, sX, sY, bX, bY] = matches;
		const pos = [+sX, +sY];
		const beacon = [+bX, +bY];

		const deltaX = Math.abs(pos[0] - beacon[0]);
		const deltaY = Math.abs(pos[1] - beacon[1]);
		const dist = deltaX + deltaY;

		const xRange = [-dist, dist].map((d) => d + pos[0]);
		const yRange = [-dist, dist].map((d) => d + pos[1]);

		sensors.push({ pos, beacon, dist, xRange, yRange });
	}

	const execute = (row) => {
		const ranges = [];

		for (const { pos, dist, yRange } of sensors) {
			if (row >= yRange[0] && row <= yRange[1]) {
				const [x, y] = pos;
				const xSpread = dist - Math.abs(y - row);
				if (xSpread < 0) return;

				ranges.push([x - xSpread, x + xSpread]);
			}
		}

		ranges.sort(([a], [b]) => a - b);

		const merged = [];
		let last;

		for (let r of ranges) {
			if (!last || r[0] > last[1] + 1) {
				merged.push(r);
				last = r;
			} else if (r[1] > last[1]) last[1] = r[1];
		}

		return merged;
	};

	for (let row = 0; (!answers[0] || !answers[1]) && row <= 4e6; ++row) {
		const ranges = execute(row);
		if (row === 2e6) {
			const [range] = ranges;
			answers[0] = range[1] - range[0];
		}
		if (ranges.length === 2) {
			const x = ranges[0][1] + 1;
			answers[1] = x * 4e6 + row;
		}
	}

	return answers;
};
