importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n').map(v => +v);
	const joltageAdapters = [...inputs].sort((a, b) => a - b);
	const adapterRatedFor = 3 + Math.max(...joltageAdapters);
	const outletJoltage = 0;
	
	const { differences } = [...joltageAdapters, adapterRatedFor].reduce((acc, val) => {
		let { prevJoltage, differences } = acc;
		++differences[((val - prevJoltage) - 1) / 2];
		return { prevJoltage: val, differences };
	}, { prevJoltage: outletJoltage, differences: [0, 0] });
	
	const numBranchesAtIndex = [0, ...joltageAdapters, adapterRatedFor].map((val, index, arr) => {
		const next = arr.slice(++index, index + 3);
		return next.filter(n => (n - val) <= 3).length;
	}).filter(v => v > 0);
	
	const patterns = [
		{ arr: [3, 3, 2, 1], multiplier: 7 },
		{ arr: [3, 2, 1], multiplier: 4 },
		{ arr: [2, 1], multiplier: 2 }
	];
	const branchMultiplier = [7, 4, 2];
	const compareArrays = (a, b) => a.every((v, i) => v === b[i]);
	
	let { n: arrangements } = Array.from({ length: numBranchesAtIndex.length }).reduce((acc, _, i) => {
		let { n, skip } = acc;
		if (--skip <= 0) {
			const next4 = numBranchesAtIndex.slice(i, i + 4);
			const pattern = patterns.find(pattern => compareArrays(pattern.arr, next4));
			if (pattern !== undefined) {
				skip = pattern.arr.length;
				n *= pattern.multiplier;
			}
		}
		return { n, skip };
	}, { n: 1, skip: 0 });
	
	result[0] = differences.reduce((acc, val) => acc * val, 1);
	result[1] = arrangements;
	
	sendResult();
};
