importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const intcodes = input.split(',').map(Number);

	const strPrompt = 'Command?';

	const stringifyOutput = (output) => String.fromCharCode(...output).trim();

	const hasPrompt = (computer) => {
		const output = stringifyOutput(
			computer.output.slice(-strPrompt.length),
		);
		return output === strPrompt || computer.halted;
	};

	const reverse = {
		north: 'south',
		south: 'north',
		east: 'west',
		west: 'east',
	};

	const parseOutput = (computer) => {
		const output = stringifyOutput(computer.output);

		if (computer.halted) {
			const password = +output.match(/\d+/)[0];
			return { analysisSuccessful: true, password };
		}

		const lines = output.split('\n').filter((c) => c && c !== strPrompt);

		if (output.startsWith('Items in your inventory:')) {
			const [_, ...items] = lines;
			return { items: items.map((item) => item.replace('- ', '')) };
		}

		const [nameStr, info, ...rest] = lines;

		const doors = [];
		const items = [];
		let curArr;
		while (rest.length) {
			const cur = rest.shift();
			if (cur.startsWith('A loud, robotic voice says')) {
				return { analysisSuccessful: false };
			} else if (cur === 'Doors here lead:') {
				curArr = doors;
			} else if (cur === 'Items here:') {
				curArr = items;
			} else if (cur.startsWith('-')) {
				curArr.push(cur.replace('- ', ''));
			} else {
				throw new Error(cur);
			}
		}

		return { name: nameStr.replace(/=/g, '').trim(), info, doors, items };
	};

	const waitForPrompt = (computer) => {
		while (!hasPrompt(computer)) {
			stepComputer(computer);
			if (computer.inLoop) break;
		}
	};

	const inputCommand = (computer, command) => {
		computer.input.push(
			...`${command}\n`.split('').map((c) => c.charCodeAt(0)),
		);
		computer.output = [];
		waitForPrompt(computer);
	};

	const checkIfStuck = (computer) => {
		const output = stringifyOutput(computer.output);
		return output.includes("You can't move!!");
	};

	const searchEnvironment = (doNotPickUp) => {
		const computer = createComputer(intcodes, []);
		waitForPrompt(computer);

		const roomInfo = parseOutput(computer);

		let curRoom = null;
		const seen = new Set([roomInfo.name]);

		const roomStack = [];

		const pathToCheckpoint = [];
		let directionToRoom;

		const queue = [];
		queue.push(...roomInfo.doors.map((door) => [roomInfo.name, door]));
		while (queue.length) {
			const [room, direction] = queue.pop();

			let stuck = false;
			for (let i = 0; curRoom && room !== curRoom; ++i) {
				if (i > 10) throw new Error();
				const undo = roomStack.pop();
				if (!undo) throw new Error();
				curRoom = undo[0];
				inputCommand(computer, reverse[undo[1]]);
				if (checkIfStuck(computer)) {
					stuck = true;
					break;
				}
			}

			inputCommand(computer, direction);

			if (stuck || checkIfStuck(computer)) {
				checkIfStuck(computer);
				return {
					success: false,
					failedOn: ['giant electromagnet'],
					password: 'stuck',
				};
			}

			const commandResponse = parseOutput(computer);

			roomStack.push([room, direction]);

			curRoom = commandResponse.name;
			seen.add(curRoom);

			if (commandResponse.items.length > 0) {
				const itemsToPickUp = commandResponse.items.filter(
					(item) => !doNotPickUp.includes(item),
				);
				for (let i = 0; i < itemsToPickUp.length; ++i) {
					const item = itemsToPickUp[i];

					computer.loopDetectionEnabled = true;
					inputCommand(computer, `take ${item}`);
					if (computer.inLoop || computer.halted) {
						return {
							success: false,
							failedOn: [item],
						};
					}
					computer.loopDetectionEnabled = false;
					computer.history.splice(0, computer.history.length);
				}
			}

			const backtrackDirection =
				reverse[roomStack[roomStack.length - 1][1]];
			const next = commandResponse.doors
				.filter((door) => door !== backtrackDirection)
				.map((door) => [curRoom, door]);
			if (curRoom === 'Security Checkpoint') {
				directionToRoom = next[0][1];
				pathToCheckpoint.push(...roomStack);
				continue;
			}

			queue.push(...next);
		}

		return {
			pathToCheckpoint,
			roomStack,
			computer,
			success: true,
			directionToRoom,
		};
	};

	const moveToCheckpoint = ({ computer, pathToCheckpoint, roomStack }) => {
		let index = pathToCheckpoint.findIndex((p, i) => p !== roomStack[i]);
		if (index > -1) {
			const backtrackCommands = roomStack
				.slice(index)
				.reverse()
				.map(([_, v]) => reverse[v]);
			backtrackCommands.forEach((command) => {
				inputCommand(computer, command);
			});
		} else index = 0;

		const commandQueue = [];
		commandQueue.push(...pathToCheckpoint.slice(index).map(([_, v]) => v));
		commandQueue.forEach((command) => inputCommand(computer, command));
	};

	const access = ({ computer, directionToRoom }) => {
		inputCommand(computer, 'inv');
		const { items } = parseOutput(computer);

		const dropItemCommand = (i) => `drop ${items[i]}`;
		const takeItemCommand = (i) => `take ${items[i]}`;

		let iters = 0;
		const runCommand = (...args) => {
			++iters;
			inputCommand(...args);
		};

		let heavies = 0;
		for (let i = 0; i < items.length; ++i) {
			runCommand(computer, dropItemCommand(i));
			runCommand(computer, directionToRoom);
			const output = stringifyOutput(computer.output);
			if (output.includes('heavier')) ++heavies;
			runCommand(computer, takeItemCommand(i));
		}

		let applyItemCommand = dropItemCommand;
		let unapplyItemCommand = takeItemCommand;
		if (heavies) {
			applyItemCommand = takeItemCommand;
			unapplyItemCommand = dropItemCommand;
			for (let i = 0; i < items.length; ++i)
				runCommand(computer, dropItemCommand(i));
		}

		Object.keys(items)
			.map((v) => +v + 1)
			.some((k) => {
				const combos = Object.keys(items).map(Number).combinations(k);
				return combos.some((combo) => {
					++iters;
					for (let j = 0; j < combo.length; ++j)
						runCommand(computer, applyItemCommand(combo[j]));

					runCommand(computer, directionToRoom);
					if (computer.halted) return true;

					for (let j = 0; j < combo.length; ++j)
						runCommand(computer, unapplyItemCommand(combo[j]));
				});
			});

		const { password } = parseOutput(computer);
		return { success: true, password };
	};

	const doNotPickUp = [];
	for (let i = 0; i <= doNotPickUp.length; ++i) {
		const pathInfo = searchEnvironment(doNotPickUp);
		if (!pathInfo.success) {
			doNotPickUp.push(...pathInfo.failedOn);
			continue;
		}

		moveToCheckpoint(pathInfo);

		result[0] = access(pathInfo).password;
	}

	sendResult();
};
