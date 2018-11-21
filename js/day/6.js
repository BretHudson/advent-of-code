importScripts('baseWorker.js');
onmessage = onmessagefunc(6, 'Signals and Noise', (input) => {
	let result = [ null, null ];
	
	let lines = input.split('\n');
	let positions = Array.from({ length: lines[0].length }).map(v => [])
	
	const aCharCode = 'a'.charCodeAt(0);
	const letterIndex = letter => letter.charCodeAt(0) - aCharCode;
	const charFromIndex = index => String.fromCharCode(aCharCode + (index % 26));
	
	lines.forEach(line => {
		line.split('').forEach((val, index) => positions[index].push(val));
	});
	
	const getWord = (positions, sortFunc) => {
		return positions.map((val) => {
			return val.reduce((acc, val) => {
				++acc[letterIndex(val)];
				return acc;
			}, Array.from({ length: 26 }).map(v => 0))
			.map((val, index) => [ charFromIndex(index), val ])
			.filter(val => val[1] > 0)
			.sort(sortFunc)[0][0];
		}).join('');
	};
	
	result[0] = getWord(positions, (a, b) => Math.sign(b[1] - a[1]));
	result[1] = getWord(positions, (a, b) => Math.sign(a[1] - b[1]));
	
	return result;
});