export const solution = (input) => {
	const answers = [null, null];

	const pairs = input
		.split('\n')
		.map((line) => line.split(/\s+/g).map(Number));

	const list1 = pairs.map(([v]) => v).sort((a, b) => a - b);
	const list2 = pairs.map(([_, v]) => v).sort((a, b) => a - b);

	answers[0] = list1
		.map((v, i) => Math.abs(v - list2[i]))
		.reduce((a, v) => a + v);
	answers[1] = list1
		.map((v) => v * list2.filter((o) => o === v).length)
		.reduce((a, v) => a + v);

	return answers;
};
