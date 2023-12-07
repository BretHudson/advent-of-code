importScripts('baseWorker.js');
onmessage = onmessagefunc(1, 'No Time for a Taxicab', (input, callback) => {
	let result = [ null, null ];
	
	input = input.split(', ');
	
	let getDist = (coord) => Math.abs(coord[0]) + Math.abs(coord[1]);
	
	let dir = 0;
	let visited = [ [ 0, 0 ] ];
	let blocks = input.reduce((acc, val) => {
		switch (val.substr(0, 1)) {
			case 'L': dir += 3; break;
			case 'R': dir += 1; break;
		}
		dir %= 4;
		
		for (let steps = parseInt(val.substr(1), 10); steps > 0; --steps) {
			switch (dir) {
				case 0: ++acc[1]; break; // North
				case 1: ++acc[0]; break; // East
				case 2: --acc[1]; break; // South
				case 3: --acc[0]; break; // West
			}
			if (result[1] === null) {
				visited.forEach((v) => {
					if ((v[0] === acc[0]) && (v[1] === acc[1]))
						result[1] = getDist(v);
				});
				visited.push(acc.slice());
			}
		}
		
		return acc;
	}, [ 0, 0 ]);
	
	result[0] = getDist(blocks);
	
	callback(result);
});