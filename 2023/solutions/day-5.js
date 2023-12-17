export const solution = (input) => {
	const answers = [null, null];

	const [seedsStr, ...sections] = input.split('\n\n');

	const seeds = [...seedsStr.matchAll(/\d+/g)].map((v) => +v);

	const maps = sections.reduce((acc, str) => {
		const [nameStr, ...values] = str.split('\n');

		const match = nameStr.match(/(?<srcCat>\w+)-to-(?<destCat>\w+) map:/);
		const { srcCat, destCat } = match.groups;

		const ranges = values.map((value) => {
			const [destStart, srcStart, range] = value
				.split(' ')
				.map((v) => +v);
			return { destStart, srcStart, range };
		});

		acc[srcCat] = { destCat, ranges };

		return acc;
	}, {});

	const convertSeedToLocation = (seed) => {
		let srcKey = 'seed';
		let curValue = seed;
		while (maps[srcKey]) {
			let curMap = maps[srcKey];

			const range = curMap.ranges.find(({ srcStart, range }) => {
				return curValue >= srcStart && curValue < srcStart + range;
			});

			// note: if no range is found, we just re-use the same value
			if (range) {
				const { srcStart, destStart } = range;
				const diff = curValue - srcStart;
				curValue = destStart + diff;
			}

			srcKey = curMap.destCat;
		}
		return curValue;
	};

	const locations = seeds.map(convertSeedToLocation);

	answers[0] = [...locations].sort((a, b) => a - b)[0];

	const seedRanges = [...seedsStr.matchAll(/\d+ \d+/g)].map((v) => {
		const [start, range] = v[0].split(' ').map((n) => +n);
		return { start, range };
	});

	const locations2 = seedRanges.map(({ start, range }) => {
		let lowest = Number.POSITIVE_INFINITY;
		for (let seed = start, end = start + range; seed < end; ++seed) {
			const location = convertSeedToLocation(seed);
			lowest = Math.min(lowest, location);
		}
		return lowest;
	});

	answers[1] = [...locations2].sort((a, b) => a - b)[0];

	return answers;
};
