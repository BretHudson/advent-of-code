importScripts('baseWorker.js');
onmessage = onmessagefunc(18, 'Like a Rogue', (input, callback) => {
	let result = [ null, null ];
	
	const TRAP = '^';
	const SAFE = '.';
	
	let generateRows = (row, iterations) => {
		let total = 0;
		for (let i = 1; i < iterations; ++i) {
			let newRow = '';
			for (let i = 0; i < row.length; ++i) {
				let left = (i > 0) ? row[i - 1] : SAFE;
				let right = (i < row.length - 1) ? row[i + 1] : SAFE;
				newRow += (left === right) ? SAFE : TRAP;
				total += +(newRow === SAFE);
			}
			row = newRow;
		}
		return total;
	}
	
	result[0] = generateRows(input, 40);
	result[1] = generateRows(input, 400000);
	
	callback(result);
});