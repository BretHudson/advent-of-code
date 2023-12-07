importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	let list, curPos, skipSize;
	
	let resetValues = () => {
		list = Array.from({ length: 256 }).map((val, index) => index);
		curPos = skipSize = 0;
	};
	
	let swap = (list, a, b) => {
		a %= list.length;
		b %= list.length;
		list[a] ^= list[b];
		list[b] ^= list[a];
		list[a] ^= list[b];
	};
	
	let processLength = (length) => {
		for (let i = 0, n = Math.floor(length / 2); i < n; ++i)
			swap(list, curPos + i, curPos + (length - 1) - i);
		curPos += (length + skipSize);
		++skipSize;
	};
	
	let getKnotHash = (key) => {
		resetValues();
		
		let asciiInput = key.split('').map(val => val.charCodeAt(0));
		asciiInput.push(17, 31, 73, 47, 23);
		
		for (let round = 0; round < 64; ++round)
			asciiInput.forEach(processLength);
		
		let chunks;
		for (chunks = []; list.length; chunks.push(list.splice(0, 16)));
		
		return chunks.map(chunk => chunk.reduce((acc, val) => acc ^= val, chunk.shift()))
			.reduce((acc, chunk) => acc + ('0' + chunk.toString(16)).substr(-2), '');
	};
	
	let gridSize = 128;
	let grid = Array.from({ length: gridSize });
	for (let row = 0; row < gridSize; ++row) {
		let key = `${input}-${row}`;
		let hash = getKnotHash(key);
		let binary = hash.split('').map(val => ('000' + parseInt(val, 16).toString(2)).substr(-4)).join('');
		grid[row] = binary.split('');
	}
	
	grid.forEach((row, rowIndex, arr) => {
		arr[rowIndex] = row.map((cell, colIndex) => {
			return { binary: cell, region: null, x: colIndex, y: rowIndex };
		});
	});
	
	let validCells = grid.reduce((acc, row) => {
		return acc.concat(row.reduce((acc, cell) => {
			if (cell.binary === '1')
				acc.push(cell);
			return acc;
		}, []));
	}, []);
	
	validCells.sort((a, b) => (b.y - a.y) ? b.y - a.y : b.x - a.x);
	
	let regions = 0;
	while (validCells.length > 0) {
		let cur = validCells.pop();
		if (cur.region !== null) continue;
		
		let region = ++regions;
		let queue = [ cur ];
		while (queue.length > 0) {
			let test = queue.pop();
			if ((test.binary === '0') || (test.region !== null)) continue;
			test.region = region;
			if (test.x > 0)
				queue.push(grid[test.y][test.x - 1]);
			if (test.x < 127)
				queue.push(grid[test.y][test.x + 1]);
			if (test.y > 0)
				queue.push(grid[test.y - 1][test.x]);
			if (test.y < 127)
				queue.push(grid[test.y + 1][test.x]);
		}
	}
	
	result[0] = grid.reduce((acc, row) => acc + row.reduce((acc, cell) => acc + +(cell.binary === '1'), 0), 0);
	result[1] = regions;
	
	callback(result);
});