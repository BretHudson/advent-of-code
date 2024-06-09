export const solution = (input) => {
	const answers = [null, null];

	const patterns = input.split('\n\n').map((pattern) => pattern.split('\n'));

	const compareLines = (lineA, lineB) => {
		return [...lineA].filter((c, i) => c !== lineB[i]).length;
	};

	const findReflection = (lines, smudge = false) => {
		const reflections = [];

		for (let i = 0; i < lines.length - 1; ++i) {
			const diff = compareLines(lines[i], lines[i + 1]);
			if (diff <= 1) {
				reflections.push(i);
			}
		}

		let count = 0;
		for (let i = 0; count === 0 && i < lines.length - 1; ++i) {
			let min = i;
			let max = i + 1;
			if (lines[min] === lines[max]) {
				reflections.push(max);
				count = max;
				for (; lines[min] && lines[max]; --min, ++max) {
					if (lines[min] === lines[max]) continue;

					count = 0;
					break;
				}
			}
		}

		if (!smudge) return count;

		const normalLine = count - 1;

		for (let i = 0; i < reflections.length; ++i) {
			let min = reflections[i];
			if (min === normalLine) continue;

			let smudgeFound = false;
			let max = min + 1;
			let count = max;

			for (; lines[min] && lines[max]; --min, ++max) {
				const diff = compareLines(lines[min], lines[max]);
				if (diff === 0) continue;
				if (!smudgeFound && diff === 1) {
					smudgeFound = true;
					continue;
				}

				count = 0;
				break;
			}

			if (smudgeFound && count) return count;
		}

		return 0;
	};

	const transpose = (rows) => {
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
		return columns;
	};

	const computeScore = (rows, smudge = false) => {
		const left = findReflection(rows, smudge);
		const above = findReflection(transpose(rows), smudge);
		return 100 * left + above;
	};

	answers[0] = patterns
		.map((pattern) => computeScore(pattern))
		.reduce((a, v) => a + v, 0);
	answers[1] = patterns
		.map((pattern) => computeScore(pattern, true))
		.reduce((a, v) => a + v, 0);

	return answers;
};
