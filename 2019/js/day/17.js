importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	// from day 9
	const [MODE_POSITION, MODE_IMMEDIATE, MODE_RELATIVE] = [0, 1, 2];

	const numParams = [4, 4, 2, 2, 3, 3, 4, 4, 2];

	const readIntcodes = (program) => {
		const { intcodes, input, output } = program;

		const firstCode = intcodes[program.position++];
		const opcode = firstCode % 100;
		const params = [];
		for (let n = numParams[opcode - 1] - 1; n--; ) {
			params.push(intcodes[program.position++]);
		}

		const modes = [
			Math.floor(firstCode / 100) % 10,
			Math.floor(firstCode / 1000) % 10,
			Math.floor(firstCode / 10000) % 10,
		];

		const getWriteAddress = (index) => {
			return (
				params[index] +
				(modes[index] === MODE_RELATIVE ? program.relativeBase : 0)
			);
		};

		const getIntcode = (index) => {
			const param = params[index];
			switch (modes[index]) {
				case MODE_POSITION:
					return intcodes[param] || 0;
				case MODE_IMMEDIATE:
					return param;
				case MODE_RELATIVE:
					return intcodes[program.relativeBase + param] || 0;
			}
		};

		switch (opcode) {
			case 1: {
				intcodes[getWriteAddress(2)] = getIntcode(0) + getIntcode(1);
				break;
			}

			case 2: {
				intcodes[getWriteAddress(2)] = getIntcode(0) * getIntcode(1);
				break;
			}

			case 3: {
				if (input.length === 0) return true;
				intcodes[getWriteAddress(0)] = input.shift();
				break;
			}

			case 4: {
				output.push(getIntcode(0));
				break;
			}

			case 5: {
				if (getIntcode(0) !== 0) {
					program.position = getIntcode(1);
				}
				break;
			}

			case 6: {
				if (getIntcode(0) === 0) {
					program.position = getIntcode(1);
				}
				break;
			}

			case 7: {
				intcodes[getWriteAddress(2)] =
					getIntcode(0) < getIntcode(1) ? 1 : 0;
				break;
			}

			case 8: {
				intcodes[getWriteAddress(2)] =
					getIntcode(0) === getIntcode(1) ? 1 : 0;
				break;
			}

			case 9: {
				program.relativeBase += getIntcode(0);
				break;
			}

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
		relativeBase: 0,
		intcodes: [...intcodes],
		input: [...input],
		output: [],
		halted: false,
	});

	const intcodes = input.split(',').map(Number);

	const program = createProgram(intcodes, []);
	while (!program.halted) {
		readIntcodes(program);
	}

	const grid = program.output.map((v) => String.fromCharCode(v));

	const gridW = grid.indexOf('\n');
	const stride = gridW + 1;
	const gridH = grid.filter((c) => c === '\n').length + 1;

	const getCell = (x, y) => {
		if (x < 0 || y < 0 || x >= gridW || y >= gridH) return '.';
		return grid[y * stride + x];
	};

	const robotIndex = grid.indexOf('^');
	let robotPos = [robotIndex % stride, Math.floor(robotIndex / stride)];
	let robotDir = '^';

	const getForward = (pos, dir) => {
		switch (dir) {
			case '^':
				return [pos[0], pos[1] - 1];
			case 'v':
				return [pos[0], pos[1] + 1];
			case '<':
				return [pos[0] - 1, pos[1]];
			case '>':
				return [pos[0] + 1, pos[1]];
		}
	};

	const turnL = {
		'^': '<',
		'<': 'v',
		v: '>',
		'>': '^',
	};
	const turnR = {
		'^': '>',
		'>': 'v',
		v: '<',
		'<': '^',
	};

	const canMove = (pos, dir) => {
		const nextPos = getForward(pos, dir);
		const nextCell = getCell(...nextPos);
		return nextCell === '#';
	};

	const moves = [];
	let forward = 0;
	while (true) {
		if (canMove(robotPos, robotDir)) {
			++forward;
			robotPos = getForward(robotPos, robotDir);
		} else {
			if (forward > 0) moves.push(forward);
			forward = 0;
			if (canMove(robotPos, turnL[robotDir])) {
				moves.push('L');
				robotDir = turnL[robotDir];
			} else if (canMove(robotPos, turnR[robotDir])) {
				moves.push('R');
				robotDir = turnR[robotDir];
			} else {
				break;
			}
		}
	}

	const intersections = [];
	const offsets = [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1],
	];

	for (let y = 0; y < gridH; ++y) {
		for (let x = 0; x < gridW; ++x) {
			if (getCell(x, y) !== '#') continue;
			const cells = offsets.map(([oX, oY]) => getCell(x + oX, y + oY));
			if (cells.filter((c) => c === '#').length >= 3) {
				intersections.push([x, y]);
			}
		}
	}

	result[0] = intersections.map(([x, y]) => x * y).reduce((a, v) => a + v, 0);

	const steps = [];
	for (let i = 0; i < moves.length; i += 2) {
		steps.push(moves[i] + moves[i + 1]);
	}
	const stepStr = steps.join('');

	const groupByN = (n) => {
		const groups = [];
		for (let i = 0; i <= steps.length - n; ++i) {
			const group = steps.slice(i, i + n).join('');

			if ((stepStr.match(new RegExp(group, 'g')) || []).length >= 2)
				groups.push(group);
		}
		return groups;
	};

	const funcs = [...new Set([...groupByN(3), ...groupByN(4)])];
	const regex = funcs.map((func) => new RegExp(func, 'g'));

	let sets;
	for (let a = 0; !sets && a < funcs.length; ++a) {
		const aStr = stepStr.replace(regex[a], '');
		for (let b = a + 1; !sets && b < funcs.length; ++b) {
			const bStr = aStr.replace(regex[b], '');
			for (let c = b + 1; c < funcs.length; ++c) {
				const cStr = bStr.replace(regex[c], '');
				if (cStr === '') {
					sets = [
						[a, b, c],
						[a, c, b],
						[b, a, c],
						[b, c, a],
						[c, a, b],
						[c, b, a],
					];
					break;
				}
			}
		}
	}

	// for some reason, some sets don't give the right value...
	for (let i = 0; i < sets.length; ++i) {
		const set = sets[i];
		const functions = set.map((v) => funcs[v]);
		const letters = ['A', 'B', 'C'];

		const mainRoutine = functions
			.reduce((acc, func, i) => {
				return acc.replace(new RegExp(func, 'g'), letters[i]);
			}, stepStr)
			.split('')
			.join(',');

		let routine = [];
		routine.push(mainRoutine);
		routine.push(
			...functions.map((func) => {
				return func.replace(/([LR])/g, ',$1,').substring(1);
			}),
		);

		routine = routine
			.join('\n')
			.split('')
			.map((v) => v.charCodeAt(0));

		const program = createProgram(intcodes, []);
		program.intcodes[0] = 2;
		program.input.push(...routine);
		while (!program.halted) {
			readIntcodes(program);
		}
		result[1] = Math.max(result[1] ?? 0, program.output.reverse()[0]);
	}

	sendResult();
};
