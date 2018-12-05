importScripts('baseWorker.js');
onmessage = onmessagefunc(25, 'Clock Signal', (input, callback) => {
	let result = [ null, null ];
	
	let INSTRUCTIONS = { cpy: 0, inc: 1, dec: 2, jnz: 3, tgl: 4, out: 5, mul: 6 };
	
	let registers = { a: 0, b: 0, c: 0, d: 0 };
	let instructions = input.split('\n').map(line => {
		let [ instruction, x, y ] = line.split(' ');
		return { orig: INSTRUCTIONS[instruction], instruction: INSTRUCTIONS[instruction], x: isNaN(x) ? x : +x, y: isNaN(y) ? y : +y };
	});
	
	let findStartingValue = () => {
		for (let a = 1; a < 200; ++a) {
			registers.a = a;
			
			let str = '';
			let state = 1;
			
			for (let index = 0, n = instructions.length; index < n; ++index)
				instructions[index].instruction = instructions[index].orig;
			
			let instr, x, y, xVal, yVal;
			for (let index = 0, n = instructions.length; (index >= 0) && (index < n); ++index) {
				instr = instructions[index];
				x = instr.x; xVal = ((isNaN(x)) ? registers[x] : x);
				y = instr.y; yVal = ((isNaN(y)) ? registers[y] : y);
				switch (instr.instruction) {
					case INSTRUCTIONS.cpy: {
						registers[y] = xVal;
					} break;
					
					case INSTRUCTIONS.inc: {
						++registers[x];
					} break;
					
					case INSTRUCTIONS.dec: {
						--registers[x];
					} break;
					
					case INSTRUCTIONS.jnz: {
						index += (xVal) ? (yVal - 1) : 0;
					} break;
					
					case INSTRUCTIONS.tgl: {
						let offset = registers[x];
						let cur = instructions[index + offset];
						if (cur === undefined) break;
						let newInstr;
						if (cur.y === undefined)
							newInstr = (cur.instruction === INSTRUCTIONS.inc) ? INSTRUCTIONS.dec : INSTRUCTIONS.inc;
						else
							newInstr = (cur.instruction === INSTRUCTIONS.jnz) ? INSTRUCTIONS.cpy : INSTRUCTIONS.jnz;
						cur.instruction = newInstr;
					} break;
					
					case INSTRUCTIONS.out: {
						if (state === xVal) {
							state = null;
							break;
						}
						
						str += (state = xVal);
						if (str.length >= 10)
							return a;
					} break;
					
					case INSTRUCTIONS.mul: {
						let iters = registers[instr.y] * registers[instr.z];
						registers[instr.z] = 0;
						registers[x] += iters;
					} break;
				}
				
				if (state === null) break;
			}
		}
	}
	
	result[0] = findStartingValue();
	result[1] = ':)';
	
	callback(result);
});