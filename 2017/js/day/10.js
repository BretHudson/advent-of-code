importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	let list = Array.from({ length: 256 });
	let curPos, skipSize;
	
	let resetValues = () => {
		list = list.map((val, index) => index);
		curPos = skipSize = 0;
	};
	
	let swap = (list, a, b) => {
		a %= list.length;
		b %= list.length;
		list[a] ^= list[b];
		list[b] ^= list[a];
		list[a] ^= list[b];
	};
	
	let processLength = (length, start) => {
		for (let i = 0, n = Math.floor(length / 2); i < n; ++i)
			swap(list, curPos + i, curPos + (length - 1) - i);
		curPos += (length + skipSize);
		++skipSize;
	};
	
	resetValues();
	input.split(',').map(val => +val).forEach(processLength);
	result[0] = list[0] * list[1];
	
	resetValues();
	let asciiInput = input.split('').map(val => val.charCodeAt(0));
	asciiInput.push(17, 31, 73, 47, 23);
	for (let round = 0; round < 64; ++round)
		asciiInput.forEach(processLength);
	
	let chunks;
	for (chunks = []; list.length; chunks.push(list.splice(0, 16)));
	
	result[1] =
		chunks.map(chunk => chunk.reduce((acc, val) => acc ^= val, chunk.shift()))
			.reduce((acc, chunk) => acc + ('0' + chunk.toString(16)).substr(-2), '');
	
	callback(result);
});