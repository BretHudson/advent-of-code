importScripts('baseWorker.js');
onmessage = onmessagefunc(15, 'Timing is Everything', (input, callback) => {
	let result = [ null, null ];
	
	let regex = /Disc #(\d) has (\d+) positions; at time=0, it is at position (\d+)./;
	let discs = input.split('\n').map(line => {
		let matches = regex.exec(line);
		return { index: +matches[1], positions: +matches[2], start: +matches[3] };
	});
	
	const getDisc = (disc, t) => (disc.start + disc.index + t) % disc.positions;
	let getCapsuleTiming = (discs) => {
		let t = 0;
		do {
			if (discs.reduce((acc, val) => acc + getDisc(val, t), 0) === 0)
				return t;
		} while (++t);
	};
	
	result[0] = getCapsuleTiming(discs);
	discs.push({ index: discs.length + 1, positions: 11, start: 0 });
	result[1] = getCapsuleTiming(discs);
	
	callback(result);
});