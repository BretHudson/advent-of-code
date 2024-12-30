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

	const inputs = input.split(',').map(Number);

	const TILE_ID = {
		EMPTY: 0,
		WALL: 1,
		BLOCK: 2,
		PADDLE: 3,
		BALL: 4,
	};

	const paint = () => {
		const grid = new Map();

		const program = createProgram(inputs, [0]);
		while (!program.halted) {
			readIntcodes(program);
		}

		while (program.output.length) {
			const x = program.output.shift();
			const y = program.output.shift();
			const tileId = program.output.shift();
			grid.set(`${x},${y}`, tileId);
		}

		return [...grid.values()].filter((v) => v === TILE_ID.BLOCK).length;
	};

	const play = () => {
		const program = createProgram(inputs, [0]);
		program.intcodes[0] = 2;

		let score = null,
			ball = 0,
			paddle = 0;
		while (!program.halted) {
			readIntcodes(program);

			if (program.output.length >= 3) {
				const x = program.output.shift();
				const y = program.output.shift();
				const tileId = program.output.shift();

				if (tileId === TILE_ID.PADDLE) {
					paddle = x;
				}
				if (tileId === TILE_ID.BALL) {
					ball = x;
				}
				if (x === -1 && y === 0) {
					score = tileId;
				}
			}

			program.input[0] = Math.sign(ball - paddle);
		}

		return score;
	};

	result[0] = paint();
	result[1] = play();

	sendResult();
};
