importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	let sequence = input.split('');
	let getTotal = (offset) => {
		return sequence.reduce((acc, val, index, arr) => {
			return acc + ((val === arr[(index + offset) % arr.length]) ? +val : 0);
		}, 0);
	};
	
	result[0] = getTotal(1);
	result[1] = getTotal(sequence.length / 2);
	
	callback(result);
});