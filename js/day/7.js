importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split(',').map(i => +i);
	
	const [
		MODE_POSITION,
		MODE_IMMEDIATE
	] = [0, 1];
	
	const getIntcode = (intcodes, param, mode) => {
		switch (mode) {
			case MODE_POSITION: return intcodes[param];
			case MODE_IMMEDIATE: return param;
		}
	};
	
	const numParams = [4, 4, 2, 2, 3, 3, 4, 4];
	
	const readIntcodes = (program) => {
		const { intcodes, input, output } = program;
		
		const firstCode = intcodes[program.position++];
		const opcode = firstCode % 100;
		const params = [];
		for (let n = numParams[opcode - 1] - 1; n--; ) {
			params.push(intcodes[program.position++]);
		};
		
		const modes = [
			Math.floor(firstCode / 100) % 10,
			Math.floor(firstCode / 1000) % 10,
			Math.floor(firstCode / 10000) % 10
		];
		
		let increment = 1;
		switch (opcode) {
			case 1: {
				intcodes[params[2]] = getIntcode(intcodes, params[0], modes[0]) + getIntcode(intcodes, params[1], modes[1]);
			} break;
			
			case 2: {
				intcodes[params[2]] = getIntcode(intcodes, params[0], modes[0]) * getIntcode(intcodes, params[1], modes[1]);
			} break;
			
			case 3: {
				if (input.length === 0) {
					return true;
				}
				intcodes[params[0]] = input.shift();
			} break;
			
			case 4: {
				output.push(getIntcode(intcodes, params[0], modes[0]));
			} break;
			
			case 5: {
				if (getIntcode(intcodes, params[0], modes[0]) !== 0) {
					program.position = getIntcode(intcodes, params[1], modes[1]);
				}
			} break;
			
			case 6: {
				if (getIntcode(intcodes, params[0], modes[0]) === 0) {
					program.position = getIntcode(intcodes, params[1], modes[1]);
				}
			} break;
			
			case 7: {
				intcodes[params[2]] = (getIntcode(intcodes, params[0], modes[0]) < getIntcode(intcodes, params[1], modes[1])) ? 1 : 0;
			} break;
			
			case 8: {
				intcodes[params[2]] = (getIntcode(intcodes, params[0], modes[0]) === getIntcode(intcodes, params[1], modes[1])) ? 1 : 0;
			} break;
			
			default:
				console.warn('Something went wrong!', opcode);
			
			case 99:
				program.halted = true;
				return false;
		}
		
		return true;
	};
	
	const createProgram = (intcodes, input) => ({
		position: 0,
		intcodes: [...intcodes],
		input: [...input],
		output: [],
		halted: false
	});
	
	const runProgram = (program) => {
		while (readIntcodes(program));
		return program.output.reverse()[0];
	};
	
	const runProgramUntilOutput = (program) => {
		while ((program.output.length === 0) && readIntcodes(program));
		return program.output.length > 0;
	};
	
	const thrusterPermutations1 = [0, 1, 2, 3, 4].permutations();
	result[0] = thrusterPermutations1.map(phaseSettings => {
		return phaseSettings.reduce((lastOutput, phase) => runProgram(createProgram(inputs, [phase, lastOutput])), 0);
	}).sort((a, b) => b - a)[0];
	
	const thrusterPermutations2 = thrusterPermutations1.map(perm => perm.map(v => v + 5));
	
	result[1] = thrusterPermutations2.map(phaseSettings => {
		const programs = phaseSettings.map(phase => createProgram(inputs, [phase]));
		
		let lastOutput = 0;
		for (let i = 0; i < 100 && programs.length > 0; ++i) {
			const program = programs.shift();
			program.input.push(lastOutput);
			runProgramUntilOutput(program);
			if (program.output.length > 0)
				lastOutput = program.output.pop();
			if (program.halted === false)
				programs.push(program);
		}
		
		// console.log(programs);
		
		return lastOutput;
	}).sort((a, b) => b - a)[0];
	
	sendResult();
};
