importScripts('baseWorker.js');
onmessage = onmessagefunc(22, 'Grid Computing', (input, callback) => {
	let result = [ null, null ];
	
	let xMax = 0, yMax = 0;
	let nodes = [];
	const getIndex = (x, y) => (y * yMax) + x;
	const getNode = (x, y) => nodes[getIndex(x, y)];
	const getXY = (n) => { return { x: n % xMax, y: Math.floor(n / xMax) }; };
	
	let regex = /x(\d+)-y(\d+)(?:\s+)(\d+)T(?:\s+)(\d+)T(?:\s+)(\d+)T(?:\s+)(\d+)%/;
	let matches, x, y;
	input.split('\n').slice(2).forEach(line => {
		let matches = regex.exec(line);
		x = +matches[1];
		xMax = Math.max(x + 1, xMax);
		y = +matches[2];
		yMax = Math.max(y + 1, yMax);
		let node = {
			x: x, y: y,
			size: +matches[3],
			used: +matches[4],
			avail: +matches[5],
			usedp: +matches[6]
		};
		nodes.push(node);
	});
	
	nodes.sort((a, b) => (a.y - b.y === 0) ? a.x - b.x : a.y - b.y);
	
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
	
	let emptyNodeIndex = null;
	for (let n = 0; n < nodes.length; ++n) {
		if (nodes[n].used === 0)
			emptyNodeIndex = n;
	}
	
	let emptySize = nodes[emptyNodeIndex].avail;
	let testGrid = new Array(nodes.length).fill(null);
	
	let queue = [ { pos: getXY(emptyNodeIndex), index: emptyNodeIndex, depth: 0 } ];
	while (queue.length > 0) {
		let cur = queue.shift();
		if ((testGrid[cur.index] !== null) && (testGrid[cur.index] <= cur.depth)) continue;
		testGrid[cur.index] = cur.depth;
		if ((cur.pos.x > 0) && (nodes[cur.index - 1].used <= emptySize))
			queue.push({ pos: getXY(cur.index - 1), index: cur.index - 1, depth: cur.depth + 1 });
		if ((cur.pos.x < xMax - 1) && (nodes[cur.index + 1].used <= emptySize))
			queue.push({ pos: getXY(cur.index + 1), index: cur.index + 1, depth: cur.depth + 1 });
		if ((cur.pos.y > 0) && (nodes[cur.index - xMax].used <= emptySize))
			queue.push({ pos: getXY(cur.index - xMax), index: cur.index - xMax, depth: cur.depth + 1 });
		if ((cur.pos.y < yMax - 1) && (nodes[cur.index + xMax].used <= emptySize))
			queue.push({ pos: getXY(cur.index + xMax), index: cur.index + xMax, depth: cur.depth + 1 });
	}
	
	result[0] = viablePairCount;
	result[1] = (5 * (xMax - 2)) + testGrid[getIndex(xMax - 1, 0)];
	
	callback(result);
});