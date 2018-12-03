importScripts('baseWorker.js');
onmessage = onmessagefunc(22, 'Grid Computing', (input, callback) => {
	let result = [ null, null ];
	
	let xMax = 0, yMax = 0;
	let nodes = [];
	const getNode = (x, y) => nodes[(x * (yMax + 1)) + y];
	
	let regex = /x(\d+)-y(\d+)(?:\s+)(\d+)T(?:\s+)(\d+)T(?:\s+)(\d+)T(?:\s+)(\d+)%/;
	let matches, x, y;
	input.split('\n').slice(2).forEach(line => {
		let matches = regex.exec(line);
		x = +matches[1];
		xMax = Math.max(x, xMax);
		y = +matches[2];
		yMax = Math.max(y, yMax);
		let node = {
			x: x, y: y,
			size: +matches[3],
			used: +matches[4],
			avail: +matches[5],
			usedp: +matches[6]
		};
		nodes.push(node);
	});
	
	console.log({ xMax, yMax });
	
	let viablePairCount = 0;
	for (let a = 0; a < nodes.length; ++a) {
		aUsed = nodes[a].used;
		if (aUsed === 0) continue;
		for (let b = 0; b < nodes.length; ++b) {
			if (a === b) continue;
			if (aUsed <= nodes[b].avail)
				++viablePairCount;
		}
	}
	
	result[0] = viablePairCount;
	
	console.log(getNode(1, 1));
	
	callback(result);
});