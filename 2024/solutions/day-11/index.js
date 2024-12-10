export const solution = (input) => {
	const answers = [null, null];

	const stones = input.split(' ').map(Number);

	const blink = (stone) => {
		if (stone === 0) {
			return [1];
		} else if (stone.toString().length % 2 === 0) {
			const digits = stone.toString();
			const left = digits.slice(0, digits.length / 2);
			const right = digits.slice(digits.length / 2, digits.length);
			return [+left, +right];
		} else {
			return [stone * 2024];
		}
	};

	console.time('one');
	let a = [...stones],
		b = [];
	const blinks = 25;
	for (let i = 0; i < blinks; ++i) {
		for (let s = 0; s < a.length; ++s) {
			const stone = a[s];
			b.push(...blink(stone));
		}
		a = [...b];
		b = [];
	}
	console.timeEnd('one');

	const reduceSum = (a, v) => a + v;

	const cache = new Map();
	const split = (stone, iter) => {
		if (!cache.has(stone)) cache.set(stone, []);

		const cachedCounts = cache.get(stone);

		if (cachedCounts[--iter]) return cachedCounts[iter];

		const next = blink(stone);
		const stoneCount =
			iter > 0
				? next.flatMap((s) => split(s, iter)).reduce(reduceSum)
				: next.length;

		cachedCounts[iter] = stoneCount;
		return stoneCount;
	};

	const getCount = (stones, blinks) => {
		return stones.map((stone) => split(stone, blinks)).reduce(reduceSum);
	};

	answers[0] = getCount(stones, 25);
	answers[1] = getCount(stones, 75);

	return answers;
};
