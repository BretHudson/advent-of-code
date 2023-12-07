importScripts('baseWorker.js');
onmessage = onmessagefunc(12, 'Leonardo\'s Monorail', (input, callback) => {
	let result = [ '', '' ];
	
	let INSTRUCTIONS = { cpy: 0, inc: 1, dec: 2, jnz: 3 };
	
	let registers = { a: 0, b: 0, c: 0, d: 0 };
	let regex = /(\w{3}) (\w+) ?(-?\w+)?/;
	let matches, x, y;
	let instructions = input.split('\n').map(line => {
		matches = regex.exec(line);
		return {
			instruction: INSTRUCTIONS[matches[1]],
			x: matches[2],
			y: matches[3]
		};
	});
	
	for (let c = 0; c < 2; ++c) {
		console.time('exec' + c);
		registers.c = c;
		for (let index = 0, inc = 0, n = instructions.length; index < n; index += inc) {
			instr = instructions[index];
			x = instr.x;
			y = instr.y;
			inc = 1;
			switch (instr.instruction) {
				case INSTRUCTIONS.cpy: {
					registers[y] = (isNaN(x)) ? registers[x] : +x;
				} break;
				
				case INSTRUCTIONS.inc: {
					++registers[x];
				} break;
				
				case INSTRUCTIONS.dec: {
					--registers[x];
				} break;
				
				case INSTRUCTIONS.jnz: {
					if (((isNaN(x)) ? registers[x] : x))
						inc = +y;
				} break;
			}
		}
		result[c] = registers.a;
		console.timeEnd('exec' + c);
	}
	
	callback(result);
});