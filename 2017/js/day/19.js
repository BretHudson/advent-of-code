importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	let grid = input.split('\n').map(line => line.split(''));
	
	let cur = { x: 0, y: 0 };
	for (; grid[0][cur.x] === ' '; ++cur.x);
	let last = { x: cur.x, y: -1 };
	
	let getPosAfterTurn = (cur, last) => {
		return [
			{ x: cur.x, y: cur.y + 1 },
			{ x: cur.x + 1, y: cur.y },
			{ x: cur.x, y: cur.y - 1 },
			{ x: cur.x - 1, y: cur.y }
		].filter(o => {
			return (grid[o.y][o.x] !== ' ') && ((last.x !== o.x) || (last.y !== o.y));
		})[0];
	};
	
	let letters = '';
	let steps = 0;
	let cell;
	while ((cell = grid[cur.y][cur.x]) !== ' ') {
		let dx = 0, dy = 0;
		switch (cell) {
			case '+': {
				let next = getPosAfterTurn(cur, last);
				dx = Math.sign(next.x - cur.x);
				dy = Math.sign(next.y - cur.y);
			} break;
			
			default: {
				letters += cell;
			} // NOTE(bret): Do not break here!
			
			case '-':
			case '|': {
				dx = Math.sign(cur.x - last.x);
				dy = Math.sign(cur.y - last.y);
			} break;
			
			case ' ': {
				dx = dy = -10000;
			} break;
		}
		
		last.x = cur.x;
		last.y = cur.y;
		cur.x += dx;
		cur.y += dy;
		
		++steps;
	}
	
	result[0] = letters;
	result[1] = steps;
	
	callback(result);
});