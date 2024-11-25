export const solution = (input) => {
	const answers = [null, null];

	const rounds = input
		.replace(/[A]/g, 1) // rock
		.replace(/[B]/g, 2) // paper
		.replace(/[C]/g, 3) // scissors
		.split('\n')
		.map((v) => {
			const _v = v.split(' ');
			return [+_v[0], _v[1]];
		});

	const scores = rounds.map(([opp, code]) => {
		const player = code.charCodeAt(0) - 87;
		// 0 for lose, 1 for tie, 2 for win
		const diff = (player - opp + 1 + 3) % 3;
		return diff * 3 + player;
	});

	answers[0] = scores.reduce((acc, v) => acc + v, 0);

	const scores2 = rounds.map(([opp, code]) => {
		switch (code) {
			case 'X': // lose
				return 0 + ((opp + 1) % 3) + 1;
			case 'Y': // draw
				return 3 + opp;
			case 'Z': // win
				return 6 + (opp % 3) + 1;
		}
	});

	answers[1] = scores2.reduce((acc, v) => acc + v, 0);

	return answers;
};
