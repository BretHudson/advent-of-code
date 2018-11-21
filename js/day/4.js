importScripts('baseWorker.js');
onmessage = onmessagefunc(4, 'Security Through Obscurity', (input) => {
	let result = [ 0, null ];
	
	let partsRegex = /([a-z\-]+)\-(\d+)\[(\w{5})\]/;
	let name, letters, room, checksum;
	let aCharCode = 'a'.charCodeAt(0);
	const letterIndex = letter => letter.charCodeAt(0) - aCharCode;
	const charFromIndex = index => String.fromCharCode(aCharCode + (index % 26));
	input.split('\n').forEach(line => {
		[ letters, room, checksum ] = line.match(partsRegex).slice(1);
		
		room = parseInt(room, 10);
		checksum = checksum.split('').sort((a, b) => a.localeCompare(b)).join('');
		
		name = letters.split('').map(val => charFromIndex(letterIndex(val) + room)).join('');
		if (name.match(/(north)|(pole)|(object)/))
			result[1] = room;
		
		letters =
			letters.replace(/\-/g, '').split('')
				.reduce((acc, val) => {
					++acc[letterIndex(val)];
					return acc;
				}, Array.from({ length: 26 }).map(v => 0))
				.map((val, index) => [ index, val ])
				.filter(val => (val[1] > 0))
				.sort((a, b) => Math.sign(b[1] - a[1]) || Math.sign(a[0] - b[0]))
				.slice(0, 5)
				.sort((a, b) => Math.sign(a[0] - b[0]))
				.reduce((acc, val) => acc + charFromIndex(val[0]), '');
		
		if (checksum === letters)
			result[0] += room;
	});
	
	return result;
});