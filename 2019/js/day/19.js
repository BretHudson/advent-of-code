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

	const inTractorBeam = (x, y) => {
		const program = createProgram(intcodes, [x, y]);
		while (program.output.length === 0) {
			readIntcodes(program);
		}
		return program.output[0] === 1;
	};

	let minX = 0,
		maxX = 0;
	result[0] = 0;
	const last100MaxX = [];
	const size = 100;
	let y = 0;
	for (; y < 50; ++y) {
		const startX = minX;
		const endX = maxX + 4;
		minX = 0;
		maxX = 0;
		for (let x = startX; x < endX; ++x) {
			if (inTractorBeam(x, y)) {
				minX ||= x;
				maxX = x + 1;
				++result[0];
			} else if (maxX > 0) break;
		}

		if (!inTractorBeam(minX + size - 1, y)) continue;
		last100MaxX.push(maxX);
		if (last100MaxX.length === size) {
			last100MaxX.shift();
		}
	}

	console.time('part two');
	for (; true; ++y) {
		for (; !inTractorBeam(minX, y); ++minX);

		if (!inTractorBeam(minX + size - 1, y)) continue;

		for (let x = minX; inTractorBeam(x, y); maxX = ++x);

		last100MaxX.push(maxX);

		if (last100MaxX.length < size) continue;

		if (last100MaxX[0] - minX === size) {
			result[1] = 10000 * minX + (y - (size - 1));
			break;
		}

		last100MaxX.shift();
	}
	console.timeEnd('part two');

	sendResult();
};
