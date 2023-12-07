importScripts('https://cdnjs.cloudflare.com/ajax/libs/spark-md5/3.0.0/spark-md5.min.js');
onmessage = (e) => {
	const replaceCharAtIndex = (str, i, c) => str.substr(0, i) + c + str.substr(i + 1, 8);
	
	let findHashes = (input, start, increment, end) => {
		let queue = [];
		
		let hash;
		for (let index = start; index < end; index += increment) {
			hash = SparkMD5.hash(input + index);
			if (hash.indexOf('00000') === 0)
				queue.push([ index, hash ]);
		}
		
		postMessage(queue);
	};
	
	let data;
	let queue;
	switch (e.data.msg) {
		case 'execute': {
			data = e.data;
			findHashes(data.input, data.start, data.increment, data.end);
		} break;
	}
};