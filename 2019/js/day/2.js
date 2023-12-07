importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split(',').map(i => +i);
	
	let position = 0;
	
	const readIntcode = (intcodes) => {
		const opcode = intcodes[position];
		const params = [
			intcodes[position + 1],
			intcodes[position + 2],
			intcodes[position + 3]
		];
		
		switch (opcode) {
			case 1: {
				intcodes[params[2]] = intcodes[params[0]] + intcodes[params[1]];
			} break;
			
			case 2: {
				intcodes[params[2]] = intcodes[params[0]] * intcodes[params[1]];
			} break;
			
			default:
				console.warn('Something went wrong!', opcode);
			case 99:
				return false;
		}
		
		position += 4;
		
		return true;
	};
	
	const runProgram = (noun, verb) => {
		position = 0;
		const intcodes = [...inputs];
		intcodes[1] = noun;
		intcodes[2] = verb;
		while (readIntcode(intcodes));
		return intcodes[0];
	}
	
	result[0] = runProgram(12, 2);
	
	const desiredOutput = 19690720;
	
	let finished = false;
	for (let noun = 0; noun <= 100; ++noun) {
		for (let verb = 0; verb <= 100; ++verb) {
			const output = runProgram(noun, verb);
			if (output === desiredOutput) {
				result[1] = 100 * noun + verb;
				finished = true;
				break;
			}
		}
		
		if (finished) break;
	}
	
	sendResult();
};
