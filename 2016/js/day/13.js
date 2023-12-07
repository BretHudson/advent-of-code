importScripts('baseWorker.js');
onmessage = onmessagefunc(13, 'A Maze of Twisty Little Cubicles', (input, callback) => {
	let result = [ null, null ];
	
	let dest = { x: 31, y: 39 };
	
	let num = +input;
	const compute = (x, y) => (x * x) + (3 * x) + (2 * x * y) + y + (y * y) + num;
	const getBinaryBits = (x, y) => compute(x, y).toString(2).replace(/0/g, '').length;
	const isOpen = (x, y) => (x >= 0) && (y >= 0) && ((getBinaryBits(x, y) & 1) === 0);
	let tryDir = (cur, x, y) => {
		if (isOpen(cur.x + x, cur.y + y)) {
			let index = (cur.y + y) * 100 + (cur.x + x);
			if (visited[index] === undefined)
				visited[index] = cur.steps + 1;
			else if (visited[index] < cur.steps + 1)
				return;
			queue.push({ x: cur.x + x, y: cur.y + y, steps: cur.steps + 1 });
		}
	};
	
	let queue = [ { x: 1, y: 1, steps: 0 } ];
	let visited = [];
	while (queue.length) {
		let cur = queue.shift();
		
		if ((cur.x === dest.x) && (cur.y === dest.y)) {
			result[0] = cur.steps;
			break;
		}
		
		tryDir(cur, -1, 0);
		tryDir(cur, 1, 0);
		tryDir(cur, 0, -1);
		tryDir(cur, 0, 1);
	}
	
	result[1] = visited.filter(val => (val !== undefined) && (val <= 50)).length;
	
	callback(result);
});