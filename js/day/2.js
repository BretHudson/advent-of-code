importScripts('baseWorker.js');
onmessage = onmessagefunc(2, 'Bathroom Security', (input) => {
	let result = [ '', '' ];
	
	let ninecode = '';
	let key9 = 5;
	let key13 = [ 0, 2 ];
	
	let key13pad = [
		[  0,   0,   1,   0,   0  ],
		[  0,   2,   3,   4,   0  ],
		[  5,   6,   7,   8,   9  ],
		[  0,  'A', 'B', 'C',  0  ],
		[  0,   0,  'D',  0,   0  ]
	];
	
	const valueAt = (x, y) => key13pad[y][x];
	const isValidMove = (x, y) => {
		x += key13[0];
		y += key13[1];
		if ((x < 0) || (x >= 5) || (y < 0) || (y >= 5))
			return 0;
		return (valueAt(x, y) !== 0) ? 1 : 0;
	}
	
	input.split('\n').forEach(line => {
		line.split('').forEach(c => {
			switch (c) {
				case 'U': {
					if (key9 > 3) key9 -= 3;
					key13[1] -= isValidMove(0, -1);
				} break;
				
				case 'R': {
					if (key9 % 3 !== 0) key9 += 1;
					key13[0] += isValidMove(1, 0);
				} break;
				
				case 'D': {
					if (key9 < 7) key9 += 3;
					key13[1] += isValidMove(0, 1);
				} break;
				
				case 'L': {
					if (key9 % 3 !== 1) key9 -= 1;
					key13[0] -= isValidMove(-1, 0);
				} break;
			}
		});
		
		result[0] += key9;
		result[1] += valueAt(key13[0], key13[1]);
	});
	
	return result;
});