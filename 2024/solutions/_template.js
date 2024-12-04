export const solution = (input) => {
	const answers = [null, null];

	const grid = input.split('\n').map((line) => {
		return (
			line
				//
				.split('')
				.map(Number)
		);
	});

	const lines = input.split('\n').map((line) => {
		return line;
	});

	answers[0] = null;
	answers[1] = null;

	return answers;
};
