importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	input = 368078;
	
	let getDistance = (cell) => {
		let per8 = Math.ceil((cell - 1) / 8) * 8;
		let level = Math.ceil((Math.sqrt(1 + per8) - 1) / 2);
		let perSide = level * 2;
		let center = perSide >> 1;
		let sideStart = (8 * (((level - 1) * level) / 2) + 1);
		return level + Math.abs(center - ((cell - sideStart) % perSide));
	};
	
	let findAmount = () => {
		let grid = [];
		let x = 0, y = 0;
		let xDir = 1, yDir = -1;
		let saveToGrid = (x, y, val = 0) => {
			for (let xx = -1; xx <= 1; ++xx) {
				for (let yy = -1; yy <= 1; ++yy) {
					if ((xx === 0) && (yy === 0)) continue;
					val += grid[(x + xx) + ',' + (y + yy)] || 0
				}
			}
			
			return grid[x + ',' + y] = val;
		};
		
		saveToGrid(0, 0, 1);
		for (let i = 1; i <= 30; ++i) {
			for (let m = 0; m < i; ++m) {
				x += xDir;
				if (saveToGrid(x, y) > input)
					return saveToGrid(x, y);
			}
			xDir *= -1;
			
			for (let m = 0; m < i; ++m) {
				y += yDir;
				if (saveToGrid(x, y) > input)
					return saveToGrid(x, y);
			}
			yDir *= -1;
		}
	};
	
	result[0] = getDistance(input);
	result[1] = findAmount(input);
	
	callback(result);
});

/* NOTE(bret): Brute force method
	let dist;
	let items, min, max;
	for (;; cur = max, ++level) {
		items = (level * inc) || 1;
		max = cur + items;
		if (input <= max) {
			let perSide = items / 4;
			let itemEdgeIndex = (input - cur) % perSide;
			dist = level + Math.abs(itemEdgeIndex - (perSide >> 1));
			break;
		}
	}
*/