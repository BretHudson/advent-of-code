importScripts('baseWorker.js');
onmessage = onmessagefunc(23, 'Safe Cracking', (input, callback) => {
	let result = [ '', '' ];
	
	let INSTRUCTIONS = { cpy: 0, inc: 1, dec: 2, jnz: 3, tgl: 4, mul: 5 };
	
	let registers = { a: 0, b: 0, c: 0, d: 0 };
	let instructions = input.split('\n').map(line => {
		let [ instruction, x, y ] = line.split(' ');
		return { orig: INSTRUCTIONS[instruction], instruction: INSTRUCTIONS[instruction], x: isNaN(x) ? x : +x, y: isNaN(y) ? y : +y };
	});
	
	// Hardcoded bc I'm a chump :(
	instructions[4].orig = INSTRUCTIONS['mul'];
	instructions[4].x = 'a';
	instructions[4].y = 'b';
	instructions[4].z = 'd';
	for (let i = 5; i < 10; ++i) {
		instructions[i].orig = INSTRUCTIONS.jnz;
		instructions[i].x = instructions[i].y = 0;
	}
	
	for (let c = 0; c < 2; ++c) {
		for (let index = 0, n = instructions.length; index < n; ++index)
			instructions[index].instruction = instructions[index].orig;
		
		registers.a = 7 + c * 5;
		
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
				
				case INSTRUCTIONS.mul: {
					let iters = registers[instr.y] * registers[instr.z];
					registers[instr.z] = 0;
					registers[x] += iters;
				} break;
			}
		}
		result[c] = registers.a;
	}
	
	result[0] = result[0];
	result[1] = result[1];
	
	callback(result);
});