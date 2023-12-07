importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	const strcmp = (a, b) => a.localeCompare(b);
	const isValid = (passphrase) =>
		passphrase
			.split(/\s/)
			.sort(strcmp)
			.filter((val, index, arr) => val === arr[(index + 1) % arr.length])
			.length === 0;
	const solve = (passphrases) => passphrases.reduce((acc, passphrase) => acc + +isValid(passphrase), 0);
	
	let passphrases = input.split('\n');
	result[0] = solve(passphrases);
	result[1] = solve(passphrases.map(val => {
		return val.split(/\s/).map(word => word.split('').sort(strcmp).join('')).join(' ')
	}));
	
	callback(result);
});