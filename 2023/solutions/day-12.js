export const solution = (input) => {
	const answers = [null, null];

	// solution via tutorial at https://www.reddit.com/r/adventofcode/comments/18hbbxe/2023_day_12python_stepbystep_tutorial_with_bonus/
	const calc = (record, groups) => {
		if (!groups.length) return !record.includes('#');
		if (!record.length) return false;

		const [curSlot] = record;
		const [curGroup] = groups;

		const pound = () => {
			let group = record.slice(0, curGroup);
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
	};

	const lines = input.split('\n').map((line) => {
		const [a, b] = line.split(' ');
		const hint = a.split('');
		const groups = b.split(',').map((v) => +v);
		return {
			hint,
			groups,
		};
	});

	answers[0] = lines
		.map(({ hint, groups }) => calc(hint, groups))
		.reduce((a, v) => a + v, 0);

	return answers;
};
