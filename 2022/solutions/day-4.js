export const solution = (input) => {
	const answers = [null, null];

	const ranges = input.split('\n').map((line) => {
		return line.split(',').map((v) => v.split('-').map(Number));
	});

	const fullyContained = ranges.filter(([a, b]) => {
		return (a[0] <= b[0] && a[1] >= b[1]) || (b[0] <= a[0] && b[1] >= a[1]);
	});

	answers[0] = fullyContained.length;

	const anyOverlap = ranges.filter(([a, b]) => {
		return (a[0] <= b[0] && a[1] >= b[0]) || (b[0] <= a[0] && b[1] >= a[0]);
	});

	answers[1] = anyOverlap.length;

	return answers;
};
