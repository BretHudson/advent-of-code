importScripts('baseWorker.js');
onmessage = onmessagefunc(8, 'Two-Factor Authentication', (input, callback) => {
	let result = [ null, '' ];
	
	let screenDim = { w: 50, h: 6 };
	let screen = Array.from({ length: screenDim.h }).map(v => Array.from({ length: screenDim.w }).map(v => '.'));
	
	let regexRect = /rect (\d+)x(\d+)/;
	let regexRotateCol = /rotate column x=(\d+) by (\d+)/;
	let regexRotateRow = /rotate row y=(\d+) by (\d+)/;
	input.split('\n').forEach(line => {
		let matches;
		
		if (matches = regexRect.exec(line)) {
			let w = parseInt(matches[1], 10);
			let h = parseInt(matches[2], 10);
			for (let y = 0; y < h; ++y) {
				for (let x = 0; x < w; ++x) {
					screen[y][x] = '#';
				}
			}
			return;
		}
		
		if (matches = regexRotateCol.exec(line)) {
			let x = parseInt(matches[1], 10);
			let iter = parseInt(matches[2], 10);
			for (; iter > 0; --iter) {
				let temp = screen[screenDim.h - 1][x];
				for (let y = screenDim.h - 1; y > 0; --y)
					screen[y % screenDim.h][x] = screen[(y - 1) % screenDim.h][x];
				screen[0][x] = temp;
			}
			return;
		}
		
		if (matches = regexRotateRow.exec(line)) {
			let y = parseInt(matches[1], 10);
			let iter = parseInt(matches[2], 10);
			for (; iter > 0; --iter) {
				let temp = screen[y][screenDim.w - 1];
				for (let x = screenDim.w - 1; x > 0; --x)
					screen[y][x % screenDim.w] = screen[y][(x - 1) % screenDim.w];
				screen[y][0] = temp;
			}
			return;
		}
	});
	
	result[0] = screen.map(line => line.join('')).join('').split('').filter(val => val === '#').length;
	
	// Thanks to /u/willkill07 who did the hard work and figured out the binary representation of all the possible letters
	// https://www.reddit.com/r/adventofcode/comments/5h52ro/2016_day_8_solutions/daxv8cr/
	let letters = {
		0x19297A52: 'A', 0x392E4A5C: 'B', 0x1928424C: 'C',
		0x39294A5C: 'D', 0x3D0E421E: 'E', 0x3D0E4210: 'F',
		0x19285A4E: 'H', 0x252F4A52: 'H', 0x1C42108E: 'I',
		0x0C210A4C: 'J', 0x254C5292: 'K', 0x2108421E: 'L',
		0x19294A4C: 'O', 0x39297210: 'P', 0x39297292: 'R',
		0x1D08305C: 'S', 0x1C421084: 'T', 0x25294A4C: 'U',
		0x23151084: 'Y', 0x3C22221E: 'Z'
	};
	
	const getLetter = (screen, pos) => letters[parseInt(screen.map(row => row.slice(pos * 5, (pos + 1) * 5)).map(line => line.map(val => (val === '#') ? 1 : 0).join('')).join(''), 2)];
	
	for (let i = 0, n = Math.floor(screenDim.w / 5); i < n; ++i)
		result[1] += getLetter(screen, i);
	
	callback(result);
});