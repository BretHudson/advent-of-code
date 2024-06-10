export const solution = (input) => {
	const answers = [null, null];

	const digPlan = input.split('\n').map((v) => {
		const { direction, meters, color } = v.match(
			/(?<direction>\w) (?<meters>\d+) \(#(?<color>\w{6})\)/,
		).groups;

		return { direction, meters: +meters, color };
	});

	const getPoints = (digPlan) => {
		let x = 0,
			y = 0;
		const points = [];
		const addPoint = (x, y) => points.push([x, y]);
		digPlan.forEach(({ direction, meters }) => {
			switch (direction) {
				case 'L':
					x -= meters;
					break;
				case 'R':
					x += meters;
					break;
				case 'U':
					y -= meters;
					break;
				case 'D':
					y += meters;
					break;
			}

			addPoint(x, y);
		});

		return points;
	};

	const area = (points) => {
		let sum = 0;
		const index = (i) => (i + points.length) % points.length;
		// this is based off of Green's theorem
		for (let i = -1; i < points.length - 1; ++i) {
			const x0 = points[index(i)][0];
			const yn1 = points[index(i - 1)][1];
			const yp1 = points[index(i + 1)][1];
			sum += x0 * (yp1 - yn1);
		}
		// add the perimeter (and an extra 1??)
		const segments = points.map((p, i) => [p, points[index(i + 1)]]);
		sum += segments.reduce((acc, [[x0, y0], [x1, y1]]) => {
			return acc + Math.abs(y1 - y0 + (x1 - x0));
		}, 0);
		return Math.abs(sum) / 2 + 1;
	};

	answers[0] = area(getPoints(digPlan));

	const directionMap = ['R', 'D', 'L', 'U'];
	const hexDigPlan = digPlan.map(({ color }) => {
		const meters = parseInt(color.substring(0, 5), 16);
		const direction = directionMap[+color[5]];
		return { direction, meters };
	});

	answers[1] = area(getPoints(hexDigPlan));

	return answers;
};
