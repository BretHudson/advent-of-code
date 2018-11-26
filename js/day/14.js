importScripts('baseWorker.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/spark-md5/3.0.0/spark-md5.min.js');
onmessage = onmessagefunc(14, 'One-Time Pad', (input, callback) => {
	let result = [ null, null ];
	
	let cache = [];
	let cacheSize = 1001;
	let regex3consecutive = /(\w)\1{2}/;
	let regex5consecutive = /(\w)\1{4}/g;
	let getHash = (salt, index, iterations) => {
		let key = index % cacheSize;
		if (cache[key].index !== index) {
			let matches;
			let hash = SparkMD5.hash(salt + index);
			for (let i = 0; i < iterations; ++i)
				hash = SparkMD5.hash(hash);
			cache[key].index = index;
			cache[key].hash = hash;
			cache[key].repeat3 = (matches = regex3consecutive.exec(hash)) ? matches[1] : null;
			cache[key].repeat5 = (matches = regex5consecutive.exec(hash)) ? matches[1] : null;
		}
		return cache[key];
	};
	
	let key = input;
	for (let part = 0; part < 2; ++part) {
		let validKeys = [];
		let iterations = part * 2016;
		for (let i = 0; i < cacheSize; ++i)
			cache[i] = { index: -1 };
		for (let i = 0; i <= 30000; ++i) {
			let curHash = getHash(key, i, iterations);
			let valid = false;
			if (curHash.repeat3 !== null) {
				for (let n = i + 1, m = i + 1000; n <= m; ++n) {
					if (curHash.repeat3 === getHash(key, n, iterations).repeat5) {
						valid = true;
						break;
					}
				}
				
				if ((valid) && (validKeys.push(i) === 64))
					break;
			}
		}
		result[part] = validKeys[63];
	}
	
	callback(result);
});