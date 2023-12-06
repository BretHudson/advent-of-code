export const solution = (input) => {
	let answers = [null, null];

	answers[0] = input
		.split('\n')
		.map((line) => line.match(/\d/g))
		.map((digits) => +(digits[0] + digits.at(-1)))
		.reduce((acc, val) => acc + val, 0);

	return answers;
};
