importScripts('baseWorker.js');
onmessage = onmessagefunc(24, 'Air Duct Spelunking', (input, callback) => {
	let result = [ null, null ];
	
	let map = input.split('\n').map(line => line.split(''));
	let goals = [];
	
	const getCell = (map, row, col) => map[col][row];
	const setCell = (map, row, col, val) => map[col][row] = val;
	const isOpen = (row, col) => map[col][row] !== '#';
	const isNewDir = (cur, x, y) => ((cur.x + x) !== cur.lastX) || ((cur.y + y) !== cur.lastY);
	
	map.forEach((row, ri) => {
		row.forEach((col, ci) => {
			if (!isNaN(col))
				goals[col] = { x: ci, y: ri, dist: [] };
		});
	});
	
	for (let i = 0, n = goals.length; i < n; ++i) {
		for (let j = 0, n = goals.length; j < n; ++j)
			goals[i].dist[j] = null;
	}
	
	let enqueue = (queue, cur, nextX, nextY) =>
		queue.push({ x: nextX, y: nextY, dist: cur.dist + 1, lastX: cur.x, lastY: cur.y });
	
	let findDistanceFor = (goal) => {
		let testMap = map.map(row => row.map(val => null));
		let cur, cell, queue = [];
		let targets = [];
		for (let i = 0; i < goals.length; ++i) {
			if ((i !== goal) && (goals[goal].dist[i] === null))
				targets.push(i);
		}
		
		enqueue(queue, { x: 0, y: 0, dist: -1 }, goals[goal].x, goals[goal].y);
		while (queue.length > 0) {
			cur = queue.shift();
			cell = getCell(testMap, cur.x, cur.y);
			if ((cell !== null) && (cur.dist >= cell))
				continue;
			
			setCell(testMap, cur.x, cur.y, cur.dist);
			
			if (isOpen(cur.x - 1, cur.y)) enqueue(queue, cur, cur.x - 1, cur.y);
			if (isOpen(cur.x + 1, cur.y)) enqueue(queue, cur, cur.x + 1, cur.y);
			if (isOpen(cur.x, cur.y - 1)) enqueue(queue, cur, cur.x, cur.y - 1);
			if (isOpen(cur.x, cur.y + 1)) enqueue(queue, cur, cur.x, cur.y + 1);
		}
		
		for (let t = 0; t < targets.length; ++t) {
			let target = targets[t];
			goals[goal].dist[target] = getCell(testMap, goals[target].x, goals[target].y);
		}
	}
	
	for (let i = 0; i < goals.length; ++i) {
		for (let j = 0; j < i; ++j)
			goals[i].dist[j] = goals[j].dist[i];
		findDistanceFor(i);
	}
	
	let createAllPermutations = (results, arr, len) => {
		if (arr.length === len) return results.push(arr);
		
		for (let i = 0; i < len; ++i) {
			if (arr.indexOf(i) === -1)
				createAllPermutations(results, arr.concat(i), len);
		}
		
		return results;
	};
	
	let permutations = createAllPermutations([], [ 0 ], goals.length);
	for (let i = 0; i < 2; ++i) {
		result[i] = Number.MAX_SAFE_INTEGER;
		
		for (let p = 0; p < permutations.length; ++p) {
			let order = permutations[p];
			let total = 0;
			for (let i = 0; i < order.length - 1; ++i) {
				total += goals[order[i]].dist[order[i + 1]];
			}
			if (i === 1)
				total += goals[order[order.length - 1]].dist[0];
			result[i] = Math.min(result[i], total);
		}
	}
	
	callback(result);
});