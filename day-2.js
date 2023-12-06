// which are possible if:
// only 12 red cubes, 13 green cubes, and 14 blue cubes
// 1, 2, 5 possible
// 3 NOT possible -> red cubes exceeded
// 4 NOT possible -> blue cubes exceed
// answer: 8 (sum of ids)

const parseHandful = (handful) => {
	const regex = /(?<count>\d+) (?<color>\w+)/g;
	const matches = [...handful.matchAll(regex)].map((m) => m.groups);
	return matches.reduce((acc, { color, count }) => {
		acc[color] = +count;
		return acc;
	}, {});
};

const test1 = 'only 12 red cubes, 13 green cubes, and 14 blue cubes';

export const solution = (input) => {
	let answers = [null, null];

	const testAmounts = parseHandful(test1);
	console.table(testAmounts);

	const games = input
		.split('\n')
		.filter((line) => line) // filter out empty lines
		.map((line) => {
			const [gameStr, handfulsStr] = line.split(':');

			const id = +gameStr.match(/\d+/)[0];
			const handfuls = handfulsStr.split(';').map(parseHandful);
			// console.table(handfuls);

			return {
				id,
				handfuls,
			};
		});

	const passingGames = games.filter(({ id, handfuls }) => {
		// console.log(`game ${id}`);
		return handfuls.every((handful, index) => {
			const { red = 0, green = 0, blue = 0 } = handful;
			// console.warn(`handful #${index}`);
			// console.table(handful);
			// console.log({
			// 	red: red < testAmounts['red'],
			// 	green: green < testAmounts['green'],
			// 	blue: blue < testAmounts['blue'],
			// });
			return (
				red <= testAmounts['red'] &&
				green <= testAmounts['green'] &&
				blue <= testAmounts['blue']
			);
		});
	});

	// console.table(games);
	console.warn('passing games:');
	console.table(passingGames);

	answers[0] = passingGames.reduce((acc, { id }) => acc + id, 0);

	answers[1] = JSON.stringify(testAmounts);

	return answers;
};
