export const solution = (input) => {
	const answers = [null, null];

	const [times, distances] = input.split('\n').map((line) => {
		return [...line.matchAll(/(\d+)/g)].map((v) => v[1]);
	});

	const calculateWaysToWin = (time, dist) => {
		let wins = 0;
		for (let hold = 0; hold <= time + 1; ++hold) {
			const d = time * hold - hold * hold;
			if (d > dist) ++wins;
		}
		return wins;
	};

	const waysToWin = [];
	for (let i = 0; i < times.length; ++i) {
		const time = +times[i];
		const dist = +distances[i];

		waysToWin.push(calculateWaysToWin(time, dist));
	}

	answers[0] = waysToWin.reduce((a, v) => a * v, 1);

	return answers;
};
