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
			case 1:
				{
					intcodes[getWriteAddress(2)] =
						getIntcode(0) + getIntcode(1);
				}
				break;

			case 2:
				{
					intcodes[getWriteAddress(2)] =
						getIntcode(0) * getIntcode(1);
				}
				break;

			case 3:
				{
					if (input.length === 0) return true;
					intcodes[getWriteAddress(0)] = input.shift();
				}
				break;

			case 4:
				{
					output.push(getIntcode(0));
				}
				break;

			case 5:
				{
					if (getIntcode(0) !== 0) {
						program.position = getIntcode(1);
					}
				}
				break;

			case 6:
				{
					if (getIntcode(0) === 0) {
						program.position = getIntcode(1);
					}
				}
				break;

			case 7:
				{
					intcodes[getWriteAddress(2)] =
						getIntcode(0) < getIntcode(1) ? 1 : 0;
				}
				break;

			case 8:
				{
					intcodes[getWriteAddress(2)] =
						getIntcode(0) === getIntcode(1) ? 1 : 0;
				}
				break;

			case 9:
				{
					program.relativeBase += getIntcode(0);
				}
				break;

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

	const DIR = { U: 0, R: 1, D: 2, L: 3 };
	const MOVE = [
		[0, -1],
		[1, 0],
		[0, 1],
		[-1, 0],
	];

	const grid = new Map();
	const curPos = [0, 0];
	let curDir = DIR.U;

	const run = (program) => {
		const key = curPos.join(',');
		const colorInput = grid.get(key);

		program.input = [colorInput];
		while (!program.halted && program.output < 2) {
			readIntcodes(program);
		}

		const color = program.output.shift();
		const turn = program.output.shift();
		grid.set(key, color);

		curDir += turn === 1 ? 1 : -1;
		curDir = (curDir + 4) % 4;

		curPos[0] += MOVE[curDir][0];
		curPos[1] += MOVE[curDir][1];
	};

	const paint = (initColor) => {
		grid.clear();
		curPos[0] = 0;
		curPos[1] = 0;
		curDir = DIR.U;

		grid.set('0,0', initColor);

		const program = createProgram(inputs, [0]);
		while (!program.halted) {
			run(program);
		}
	};

	paint(0);
	result[0] = grid.size - 1; // why off by 1 ?!?!

	paint(1);
	let minX = Number.POSITIVE_INFINITY,
		maxX = Number.NEGATIVE_INFINITY,
		minY = Number.POSITIVE_INFINITY,
		maxY = Number.NEGATIVE_INFINITY;

	const coords = [...grid.keys()].map((key) => key.split(',').map(Number));

	coords.forEach(([x, y]) => {
		minX = Math.min(minX, x);
		maxX = Math.max(maxX, x);
		minY = Math.min(minY, y);
		maxY = Math.max(maxY, y);
	});

	const drawnGrid = Array.from({ length: maxY - minY + 1 }).map(() => {
		return Array.from({ length: maxX - minX + 1 }).map(() => '.');
	});

	coords.forEach((coord) => {
		const [x, y] = coord;
		if (grid.get(coord.join(','))) drawnGrid[y][x] = '#';
	});

	result[1] = drawnGrid.map((line) => line.join('')).join('\n');

	sendResult();
};
