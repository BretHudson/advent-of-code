export const solution = (input) => {
	const answers = [null, null];

	const strings = input.replaceAll('\n', '').split(',');

	answers[0] = strings.reduce((acc, string) => {
		let curVal = 0;
		for (let i = 0; i < string.length; ++i) {
			const c = string[i];
			const charCode = c.charCodeAt(0);
			curVal += charCode;
			curVal *= 17;
			curVal %= 256;
		}
		return acc + curVal;
	}, 0);

	return answers;
};
