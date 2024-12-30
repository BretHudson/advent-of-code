importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const cups = input.split('').map(Number);
	const lowest = Math.min(...cups);
	let highest = Math.max(...cups);

	const initialMap = {};
	for (let i = 0; i < cups.length; ++i) {
		const a = cups[i];
		const b = cups[(i + 1) % cups.length];
		initialMap[a] = b;
	}

	const getProceedingCups = (map, n, count) => {
		const next = [];
		for (let i = 0; i < count; ++i) {
			next.push(map[n]);
			n = next[i];
		}
		return next;
	};

	const execute = (map, iters) => {
		let current = cups[0];
		for (let i = 0; i < iters; ++i) {
			const pickedUp = getProceedingCups(map, current, 3);
			let dest = current;
			do {
				dest = dest === lowest ? highest : dest - 1;
			} while (pickedUp.includes(dest));

			map[current] = map[pickedUp[2]];
			map[pickedUp[2]] = map[dest];
			map[dest] = pickedUp[0];

			current = map[current];
		}
	};

	const map = { ...initialMap };
	execute(map, 100);
	result[0] = getProceedingCups(map, 1, cups.length - 1).join('');

	const map1m = { ...initialMap };
	let current = cups[cups.length - 1];
	for (let i = highest + 1; i <= 1_000_000; ++i) {
		map1m[current] = i;
		current = i;
	}
	map1m[current] = cups[0];
	highest = current;

	execute(map1m, 10_000_000);

	result[1] = getProceedingCups(map1m, 1, 2).reduce((a, v) => a * v);

	sendResult();
};
