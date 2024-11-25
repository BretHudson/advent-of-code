const findOverlap = (...strings) => {
	const [a, ...rest] = strings;
	return a.split('').find((type) => rest.every((b) => b.indexOf(type) > -1));
};

const mapPriority = (type) => {
	return type.charCodeAt(0) - (type.toLowerCase() === type ? 96 : 38);
};

const reduceSum = (acc, v) => acc + v;

export const solution = (input) => {
	const answers = [null, null];

	const rucksacks = input.split('\n').map((line) => {
		const half = line.length / 2;
		return [line.substring(0, half), line.substring(half)];
	});

	const overlaps = rucksacks.map(([a, b]) => findOverlap(a, b));

	answers[0] = overlaps.map(mapPriority).reduce(reduceSum, 0);

	const groups = [];
	for (let i = 0, n = rucksacks.length / 3; i < n; ++i) {
		const offset = i * 3;
		groups.push(rucksacks.slice(offset, offset + 3));
	}

	const types = groups.map((group) => {
		return findOverlap(...group.map((l) => l.join('')));
	});

	answers[1] = types.map(mapPriority).reduce(reduceSum, 0);

	return answers;
};

// export const solution = (input) => {
// 	const answers = [null, null];

// 	const rucksacks = input.split('\n').map((line) => {
// 		const half = line.length / 2;
// 		return [line.substring(0, half), line.substring(half)];
// 	});

// 	const overlaps = rucksacks.map(([a, b]) => {
// 		return a.split('').find((type) => b.indexOf(type) > -1);
// 	});

// 	const priorities = overlaps.map((type) => {
// 		const offset = type.toLowerCase() === type ? 96 : 38;
// 		return type.charCodeAt(0) - offset;
// 	});

// 	answers[0] = priorities.reduce((acc, v) => acc + v, 0);

// 	return answers;
// };
