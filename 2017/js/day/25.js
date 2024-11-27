importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [null, '⭐'];

	const OP = {
		WRITE_VALUE: 1,
		MOVE: 2,
		SET_STATE: 3,
	};

	let charToStateIndex = (c) => c.charCodeAt(0) - 65;
	let parseState = (line) =>
		charToStateIndex(/state (?<state>\w)/.exec(line).groups?.state);

	let [initStr, ...stateStrs] = input.split('\n\n');

	let tape = new Set();
	let cursor = 0;
	let stateIndex = parseState(initStr);
	let stepsToRun = +/after (?<steps>\d+) steps/.exec(initStr).groups?.steps;

	let states = stateStrs.map((str) => {
		let lines = str.split('\n');
		let state = [];
		for (let i = 0; i < 2; ++i) {
			let offset = i * 4;
			let subState = lines.slice(offset + 2, offset + 5).map((line) => {
				let [_, word] = line.trim().split(' ');
				switch (word) {
					case 'Write':
						return [OP.WRITE_VALUE, line.includes('1') ? 1 : 0];
					case 'Move':
						return [OP.MOVE, line.includes('right') ? 1 : -1];
					case 'Continue':
						return [OP.SET_STATE, parseState(line)];
					default:
						throw new Error(`"${word}" not a valid instruction`);
				}
			});
			state.push(subState);
		}
		return state;
	});

	for (let step = 0; step < stepsToRun; ++step) {
		let state = states[stateIndex];

		let isSet = tape.has(cursor) ? 1 : 0;
		let ops = state[isSet];

		for (let i = 0; i < 3; ++i) {
			let [op, arg] = ops[i];
			switch (op) {
				case OP.WRITE_VALUE:
					if (arg) tape.add(cursor);
					else tape.delete(cursor);
					break;
				case OP.MOVE:
					cursor += arg;
					break;
				case OP.SET_STATE:
					stateIndex = arg;
					break;
			}
		}
	}

	result[0] = tape.size;

	callback(result);
});
