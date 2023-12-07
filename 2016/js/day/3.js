importScripts('baseWorker.js');
onmessage = onmessagefunc(3, 'Squares With Three Sides', (input, callback) => {
	let result = [ 0, null ];
	
	const regex = /(\d+)/g;
	const ascSort = (a, b) => Math.sign(a - b);
	const valid = lengths => ((lengths[0] + lengths[1]) > lengths[2]);
	
	let rows = [ [ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ] ];
	
	input.split('\n').forEach((line, index) => {
		let lengths = line.match(regex).map(n => parseInt(n, 10))
		
		for (let i = 0; i < 3; ++i)
			rows[i][index % 3] = lengths[i];
		
		if ((index % 3) === 2) {
			rows.forEach(row => {
				result[1] += valid(row.sort(ascSort));
			});
		}
		
		result[0] += valid(lengths.sort(ascSort));
	});
	
	callback(result);
});