export const solution = (input) => {
	const answers = [null, null];

	const [times, distances] = input.split('\n').map((line) => {
		return [...line.matchAll(/(\d+)/g)].map((v) => v[1]);
	});

	const calculateDistance = (time, hold) => {
		return time * hold - hold * hold;
	};

	const calculateWaysToWin = (time, dist) => {
		const b = time;
		const c = -dist;

		const x1 = Math.ceil((-b + Math.sqrt(b * b + 4 * c)) / -2 + 0.00001);
		const x2 = Math.floor((-b - Math.sqrt(b * b + 4 * c)) / -2 - 0.00001);
		return x2 - x1 + 1;

		/// loop method, too slow for part 2
		// let wins = 0;
		// for (let hold = 0; hold <= time + 1; ++hold) {
		// 	const d = time * hold - hold * hold;
		// 	if (d > dist) ++wins;
		// }
		// return wins;
	};

	const waysToWin = [];
	for (let i = 0; i < times.length; ++i) {
		const time = +times[i];
		const dist = +distances[i];

		waysToWin.push(calculateWaysToWin(time, dist));
	}

	const totalTime = times.join('');
	const totalDist = distances.join('');

	answers[0] = waysToWin.reduce((a, v) => a * v, 1);
	answers[1] = calculateWaysToWin(totalTime, totalDist);

	return answers;
};
