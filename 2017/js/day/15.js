importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	let regex = /Generator A starts with (\d+)\nGenerator B starts with (\d+)/;
	let generators = input.match(regex).splice(1, 3).map(val => +val);
	
	let factors = [ 16807, 48271 ];
	let divider = 2147483647;
	let criteria = [ 4, 8 ];
	let values = [ [], [] ];
	
	let part1Count = 0;
	let numIters = 40000000;
	let numValues = 5000000;
	for (let i = 0;
		(i < numIters) || (values[0].length < numValues) || (values[1].length < numValues);
		++i) {
		for (let g = 0; g < 2; ++g) {
			generators[g] = (generators[g] * factors[g]) % divider;
			if (generators[g] % criteria[g] === 0)
				values[g].push(generators[g]);
		}
		
		if ((i < numIters) && ((generators[0] & 0xFFFF) === (generators[1] & 0xFFFF)))
			++part1Count;
	}
	
	let part2Count = 0; 
	for (let v = 0, n = Math.min(values[0].length, values[1].length); v < n; ++v) {
		if ((values[0][v] & 0xFFFF) === (values[1][v] & 0xFFFF))
			++part2Count;
	}
	
	result[0] = part1Count;
	result[1] = part2Count;
	
	callback(result);
});