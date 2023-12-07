importScripts('baseWorker.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/spark-md5/3.0.0/spark-md5.min.js');
onmessage = onmessagefunc(5, 'How About a Nice Game of Chess?', (input, callback) => {
	let result = [ '', '--------' ];
	
	const replaceCharAtIndex = (str, i, c) => str.substr(0, i) + c + str.substr(i + 1, 8);
	
	let workers = [];
	let numWorkers = 8;
	
	let iter = 0;
	let timesPerIter = 60000;
	let waitingFor;
	
	let queue = [];
	
	let callWorkers = () => {
		for (let i = 0; i < numWorkers; ++i) {
			workers[i].postMessage({
				msg: 'execute',
				input: input,
				start: i + iter * timesPerIter,
				increment: numWorkers,
				end: i + (iter + 1) * timesPerIter
			});
			waitingFor = numWorkers;
		}
		++iter;
	}
	
	let processHash = (hash) => {
		if (result[0].length < 8)
			result[0] += hash.charAt(5);
		
		let index = parseInt(hash.charAt(5), 10);
		if ((index < 8) && (result[1].charAt(index) === '-'))
			result[1] = replaceCharAtIndex(result[1], index, hash.charAt(6));
	}
	
	let processQueue = () => {
		queue.sort((a, b) => Math.sign(a[0] - b[0])).map(val => val[1]).forEach(processHash);
		queue = [];
		
		let hash = SparkMD5.hash(input + (iter * timesPerIter));
		postMessage({
			msg: 'result',
			result: [
				(result[0] + hash).substring(0, 8),
				result[1].split('').map((val, index) => (val === '-') ? hash.charAt(index + 8) : val).join('')
			]
		});
		
		if ((result[0].length < 8) || (result[1].indexOf('-') > -1)) {
			callWorkers();
		} else {
			for (let i = 0; i < numWorkers; ++i)
				workers[i].terminate();
			callback(result);
		}
	};
	
	for (let i = 0; i < numWorkers; ++i) {
		let worker = new Worker('./5subworker.js');
		worker.onmessage = (e) => {
			queue.push(...e.data);
			if (--waitingFor === 0)
				processQueue();
		};
		workers.push(worker);
	}
	
	callWorkers();
});