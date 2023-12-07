importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	
	let instructions = input.split('\n').map(line => line.split(' '));
	
	let parseInstr = (instruction, registers) => {
		let [ instr, X, Y ] = instruction;
		
		if ((X !== undefined) && (isNaN(X)))
			registers[X] = registers[X] || 0;
		
		if ((Y !== undefined) && (isNaN(Y)))
			Y = registers[Y] = registers[Y] || 0;
		else
			Y = +Y;
		
		return [ instr, X, Y ];
	};
	
	const sharedInstrFunc = {
		set: (registers, X, Y) => { registers[X] = +Y; },
		add: (registers, X, Y) => { registers[X] += Y; return 1; },
		mul: (registers, X, Y) => { registers[X] *= Y; return 1; },
		mod: (registers, X, Y) => { registers[X] %= Y; return 1; },
		jgz: (registers, X, Y) => { return ((isNaN(X) ? registers[X] : X) > 0) ? Y : 1; }
	};
	
	let soundFunc = Object.assign({
		snd: (registers, X, Y) => { lastSound = registers[X]; return 1; },
		rcv: (registers, X, Y) => {
			if (registers[X] !== 0)
				answer = lastSound;
			return 1;
		}
	}, sharedInstrFunc);
	
	let sendFunc = Object.assign({
		snd: (registers, X, Y, other) => {
			other.queue.push(isNaN(X) ? registers[X] : X);
			++registers.sent;
			return 1;
		},
		rcv: (registers, X, Y) => {
			if (registers.queue.length > 0) {
				registers[X] = registers.queue.shift();
				return 1;
			}
			return 0;
		}
	}, sharedInstrFunc);
	
	let lastSound = null;
	let answer = null;
	let part1 = (instrFunc) => {
		let registers = { index: 0 };
		let iter = 0;
		while (registers.index < instructions.length) {
			executeNextInstr(instrFunc, registers);
			if (answer !== null) return answer;
			if (++iter > 10000) return;
		}
	};
	
	let executeNextInstr = (instrFunc, registers, other) => {
		let [ instr, X, Y ] = parseInstr(instructions[registers.index], registers);
		let inc = instrFunc[instr](registers, X, Y, other);
		registers.index += (inc !== undefined) ? inc : 1;
	};
	
	const isFinished = registers => (instructions[registers.index][0] === 'rcv') && (registers.queue.length === 0);
	
	let part2 = (instrFunc) => {
		let programs = Array.from({ length: 2 }).map((v, p) => {
			return { id: p, index: 0, sent: 0, queue: [], p: p };
		});
		
		for (;;) {
			programs.forEach(registers => executeNextInstr(instrFunc, registers, programs[1 - registers.id]));
			
			if ((isFinished(programs[0])) && (isFinished(programs[1])))
				return programs[1].sent;
		}
	};
	
	result[0] = part1(soundFunc);
	result[1] = part2(sendFunc);
	
	callback(result);
});