importScripts('baseWorker.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/spark-md5/3.0.0/spark-md5.min.js');
onmessage = onmessagefunc(17, 'Two Steps Forward', (input, callback) => {
	let result = [ null, null ];
	
	let canMove = (pos, dir, val) => {
		switch (val) {
			case 'b':
			case 'c':
			case 'd':
			case 'e':
			case 'f': {
				switch (dir) {
					case 'U': return (pos.y > 0);
					case 'D': return (pos.y < 3);
					case 'L': return (pos.x > 0);
					case 'R': return (pos.x < 3);
				}
			}
			
			default:
				return false;
		}
	};
	
	let possible = [ '' ];
	let paths = [];
	let pos = { x: 0, y: 0 };
	let dir = [ 'U', 'D', 'L', 'R' ];
	while (possible.length > 0) {
		let pathSoFar = possible.shift();
		pos.x = pos.y = 0;
		for (let p = 0, n = pathSoFar.length; p < n; ++p) {
			switch (pathSoFar.charAt(p)) {
				case 'U': --pos.y; break;
				case 'D': ++pos.y; break;
				case 'L': --pos.x; break;
				case 'R': ++pos.x; break;
			}
		}
		
		if ((pos.x === 3) && (pos.y === 3)) {
			paths.push(pathSoFar);
			continue;
		}
		
		let hash = SparkMD5.hash(input + pathSoFar);
		for (let d = 0; d < 4; ++d) {
			if (canMove(pos, dir[d], hash[d]))
				possible.push(pathSoFar + dir[d]);
		}
	}
	
	result[0] = paths[0];
	result[1] = paths[paths.length - 1].length;
	
	callback(result);
});