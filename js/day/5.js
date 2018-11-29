importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	let jumps = input.split('\n').map(val => +val);
	
	const mightaswell = (jumps, func) => {
		let steps = 0, iter = 0, next;
		while (iter < jumps.length) {
			next = iter + jumps[iter];
			jumps[iter] += func(jumps[iter]);
			iter = next;
			++steps;
		}
		return steps;
	};
	
	result[0] = mightaswell(jumps.slice(), (val) => 1);
	result[1] = mightaswell(jumps.slice(), (val) => (val >= 3) ? -1 : 1);
	
	callback(result);
});