importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [null, null];

	let parseInstructions = (input) =>
		input.split('\n').map((line) => line.split(' '));

	let instructions = parseInstructions(input);

	let sharedInstrFunc = {
		set: (registers, X, Y) => {
			registers[X] = Y;
		},
		sub: (registers, X, Y) => {
			registers[X] -= Y;
		},
		mul: (registers, X, Y) => {
			registers[X] *= Y;
			++registers.mulHit;
		},
		jnz: (registers, X, Y) => {
			if ((isNaN(X) ? registers[X] : X) !== 0) return Y;
		},
		mod: (registers, X, Y) => {
			registers[X] %= Y;
		},
	};

	const execute = (instrFunc) => {
		const registers = Object.fromEntries(
			Array.from({ length: 8 }, (_, i) => [
				String.fromCharCode(97 + i),
				0,
			]),
		);
		registers.index = 0;
		registers.mulHit = 0;
		while (registers.index < instructions.length) {
			let [instr, X, Y] = instructions[registers.index];
			Y = isNaN(Y) ? registers[Y] : +Y;
			registers.index += instrFunc[instr](registers, X, Y) ?? 1;
		}
		return registers;
	};

	let part1 = (instrFunc) => execute(instrFunc).mulHit;
	let part2 = (instrFunc) => execute(instrFunc).h;

	result[0] = part1(sharedInstrFunc);

	// apply patch
	instructions = [
		parseInstructions('set a 1'),
		instructions.slice(0, 10),
		parseInstructions(`set g b
mod g d
jnz g 3
set f 0
jnz 1 9
sub d -1
set g d
sub g b
jnz g -8
jnz 1 5
jnz 1 4
jnz 1 3
jnz 1 2
jnz 1 1`),
		instructions.slice(24, instructions.length),
	].flat();

	result[1] = part2(sharedInstrFunc);

	callback(result);
});
