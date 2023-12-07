importScripts('baseWorker.js');
onmessage = onmessagefunc(16, 'Dragon Checksum', (input, callback) => {
	let result = [ null, null ];
	
	let modifiedDragonCurve = (data) => data + '0' + [...data].reverse().map(val => 1 - val).join('');
	let generateChecksum = (data) => {
		do {
			data = data.replace(/.{2}/g, m => +(m[0] === m[1]));
		} while (data.length % 2 === 0);
		return data;
	};
	
	let fillDisk = (data, size) => {
		while (data.length < size)
			data = modifiedDragonCurve(data);
		return generateChecksum(data.substring(0, size));
	}
	
	result[0] = fillDisk(input, 272);
	result[1] = fillDisk(input, 35651584);
	
	callback(result);
});