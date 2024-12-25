export const solution = (input) => {
	const answers = [null, 'Ho ho ho!'];

	const locksAndKeys = input.split('\n\n').map((block) => {
		const lines = block.split('\n');
		const heights = Array.from(lines[0], () => 0);
		for (let i = 1; i < lines.length - 1; ++i) {
			for (let j = 0; j < heights.length; ++j) {
				if (lines[i].charAt(j) === '#') {
					++heights[j];
				}
			}
		}
		return {
			type: lines[0] === '#####' ? 'locks' : 'keys',
			heights,
		};
	});

	const { locks, keys } = Object.groupBy(locksAndKeys, ({ type }) => type);
	answers[0] = locks.reduce((acc, pin) => {
		return keys.reduce((acc, key) => {
			return key.heights
				.map((h, i) => pin.heights[i] + h)
				.every((v) => v <= 5)
				? acc + 1
				: acc;
		}, acc);
	}, 0);

	return answers;
};
