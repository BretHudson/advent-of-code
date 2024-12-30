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

	const visited = new Set();

	let pos = [0, 0];
	const v2Add = (a, b) => [a[0] + b[0], a[1] + b[1]];

	const _opposite = { 1: 2, 2: 1, 3: 4, 4: 3 };
	const opposite = (v) => _opposite[v];
	const offsets = [
		[0, -1], // north
		[0, 1], // south
		[-1, 0], // west
		[1, 0], // east
	];

	const tryMove = (dir) => {
		program.input.push(dir);
		while (!program.output.length) {
			readIntcodes(program);
		}
		const status = program.output.shift();
		if (status > 0) {
			pos = v2Add(pos, offsets[dir - 1]);
			visited.add(pos.join(','));
		}
		return status;
	};

	let found, foundAt;
	const testDirections = (last) => {
		const moves = [];
		const reverse = opposite(last);
		for (let i = 1; i <= 4; ++i) {
			if (i === reverse) continue;
			const status = tryMove(i);
			if (status === 0) continue;

			moves.push(i);
			tryMove(opposite(i));

			if (status === 2) {
				found = forward + 1;
				foundAt = pos;
			}
		}

		return moves;
	};

	let forward = 0;
	const findPathToBranch = (last) => {
		const moves = [];

		let nextMoves = testDirections(last);
		do {
			const [i] = nextMoves;
			tryMove(i);
			++forward;
			moves.push(i);
			last = i;
			nextMoves = testDirections(last);
		} while (nextMoves.length === 1);

		return { moves, nextMoves };
	};

	const followPath = (path, track = 1) => {
		forward += path.length * track;
		path.every(tryMove);
	};

	const backTrack = (path) => followPath(path.map(opposite).reverse(), -1);

	const queue = [[]];
	while (queue.length) {
		const path = queue.shift();
		followPath(path);

		const { moves, nextMoves } = findPathToBranch(path[path.length - 1]);

		const fullPath = path.concat(moves);
		queue.push(...nextMoves.map((m) => fullPath.concat([m])));
		backTrack(fullPath);
	}

	const queues = [[foundAt.join(',')], []];
	const filled = new Set();
	let minutes = 0;
	for (; queues.flat().length; ++minutes, queues.reverse()) {
		const [queue, nextQueue] = queues;
		while (queue.length) {
			const pos = queue.shift().split(',').map(Number);
			for (let i = 0; i < 4; ++i) {
				const nextPos = v2Add(pos, offsets[i]).join(',');
				if (filled.has(nextPos)) continue;

				if (visited.has(nextPos)) {
					filled.add(nextPos);
					nextQueue.push(nextPos);
				}
			}
		}
	}

	result[0] = found;
	result[1] = minutes;

	sendResult();
};
