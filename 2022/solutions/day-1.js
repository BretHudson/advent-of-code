export const solution = (input) => {
	const answers = [null, null];

	const elves = input
		.split('\n\n')
		.map((elf) => {
			return elf
				.split('\n')
				.map((v) => +v)
				.reduce((acc, v) => acc + v, 0);
		})
		.sort((a, b) => b - a);

	answers[0] = elves[0];
	answers[1] = elves.slice(0, 3).reduce((acc, v) => acc + v, 0);

	return answers;
};
