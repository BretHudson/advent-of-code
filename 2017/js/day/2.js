importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	let rows = input.split('\n').map(row => row.split(/\s/).map(val => +val).sort((a, b) => Math.sign(b - a)));
	
	result[1] = rows.reduce((acc, row) => {
		let dividend, divisor;
		for (let i = 0; i < row.length - 1; ++i) {
			dividend = +row[i];
			for (let j = i + 1; j < row.length; ++j) {
				divisor = +row[j];
				if ((dividend % divisor) === 0)
					return acc + (dividend / divisor);
			}
		}
	}, 0);
	
	result[0] = rows.reduce((acc, row) => {
		row.splice(1, row.length - 2);
		return acc + (row[0] - row[1]);
	}, 0);
	
	callback(result);
});