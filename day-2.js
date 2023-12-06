// returns an object of the type
// { red?: number, green?: number, blue?: number }
const parseHandful = (handful) => {
	const matches = handful.matchAll(/(?<count>\d+) (?<color>\w+)/g);
	return [...matches]
		.map((m) => m.groups)
		.reduce((acc, { color, count }) => {
			acc[color] = +count;
			return acc;
		}, {});
};

export const solution = (input) => {
	let answers = [null, null];

	// Part 1
	const testAmounts = parseHandful(
		'only 12 red cubes, 13 green cubes, and 14 blue cubes',
	);

	const games = input
		.split('\n')
		.filter((line) => line) // filter out empty lines
		.map((line) => {
			const [gameStr, handfulsStr] = line.split(':');

			return {
				id: +gameStr.match(/\d+/)[0],
				handfuls: handfulsStr.split(';').map(parseHandful),
			};
		});

	const passingGames = games.filter(({ handfuls }) => {
		return handfuls.every((handful) => {
			return Object.entries(handful).every(
				([color, count]) => count <= testAmounts[color],
			);
		});
	});

	answers[0] = passingGames.reduce((acc, { id }) => acc + id, 0);

	// Part 2
	const powers = games.map(({ handfuls }) => {
		const max = handfuls.reduce(
			(acc, handful) => {
				Object.keys(handful).forEach((key) => {
					acc[key] = Math.max(acc[key], handful[key]);
				});

				return acc;
			},
			{ red: 0, green: 0, blue: 0 },
		);

		return Object.values(max).reduce((acc, val) => acc * val, 1);
	});

	answers[1] = powers.reduce((acc, val) => acc + val, 0);

	return answers;
};
