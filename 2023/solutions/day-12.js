export const solution = (input) => {
	const answers = [null, null];

	const lines = input.split('\n').map((line) => {
		const [hint, b] = line.split(' ');
		const groups = b.split(',').map((v) => +v);
		return {
			hint,
			groups,
		};
	});

	// solution via tutorial at https://www.reddit.com/r/adventofcode/comments/18hbbxe/2023_day_12python_stepbystep_tutorial_with_bonus/
	const cache = new Map();
	let calc = (record, groups) => {
		if (!groups.length) return !record.includes('#');
		if (!record.length) return false;

		const [curSlot] = record;
		const [curGroup] = groups;

		const pound = () => {
			let group = [...record.slice(0, curGroup)];
			group = group.map((v) => (v === '?' ? '#' : v));

			const damaged = group.filter((v) => v === '#');
			if (damaged.length !== curGroup) return false;

			if (record.length === curGroup) {
				return groups.length === 1;
			}

			if (record[curGroup] !== '#') {
				return calc(record.slice(curGroup + 1), groups.slice(1));
			}

			return 0;
		};

		const dot = () => calc(record.slice(1), groups);

		switch (curSlot) {
			case '#':
				return pound();
			case '.':
				return dot();
			case '?':
				return dot() + pound();
		}

		console.log('what');
	};

	const _calc = calc;
	calc = (record, groups) => {
		const hash = [record, groups.join(',')].join(' ');
		if (cache.has(hash)) return cache.get(hash);

		const value = _calc(record, groups);
		cache.set(hash, value);
		return value;
	};

	const compute = (lines) =>
		lines
			.map(({ hint, groups }) => calc(hint, groups))
			.reduce((a, v) => a + v, 0);

	const foldedLines = lines.map(({ hint, groups }) => {
		const newHint = Array.from({ length: 5 }, () => hint).join('?');
		const newGroups = Array.from({ length: 5 }, () => groups).flat();
		return {
			hint: newHint,
			groups: newGroups,
		};
	});

	answers[0] = compute(lines);
	answers[1] = compute(foldedLines);

	return answers;
};
