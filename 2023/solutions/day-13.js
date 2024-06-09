export const solution = (input) => {
	const answers = [null, null];

	const patterns = input.split('\n\n');

	const findReflection = (lines) => {
		let maxCount = 0;
		for (let i = 0; i < lines.length - 1; ++i) {
			let min = i;
			let max = i + 1;
			if (lines[min] === lines[max]) {
				let count = max;
				for (; lines[min] && lines[max]; --min, ++max) {
					if (lines[min] !== lines[max]) {
						count = 0;
						break;
					}
				}
				maxCount = Math.max(count, maxCount);
			}
		}

		return maxCount;
	};

	const computeScore = (pattern) => {
		const rows = pattern.split('\n');

		const width = rows[0].length;
		const height = rows.length;

		const columns = [];
		for (let c = 0; c < width; ++c) {
			const col = [];
			for (let i = 0; i < height; ++i) {
				col.push(rows[i][c]);
			}
			columns.push(col.join(''));
		}

		const left = findReflection(rows);
		const above = findReflection(columns);
		console.log({ left, above });
		return above + 100 * left;
	};

	answers[0] = patterns.reduce((acc, pattern) => {
		return acc + computeScore(pattern);
	}, 0);

	return answers;
};
