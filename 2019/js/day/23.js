importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const intcodes = input.split(',').map(Number);

	const numComputers = 50;
	const computers = Array.from({ length: numComputers }, (_, i) => {
		const program = createComputer(intcodes, []);

		program.input.push(i);
		stepComputer(program);

		return {
			program,
			packetQueue: [],
			waitingForInput: program.waitingForInput,
		};
	});

	const packetsSent = [];
	let lastPacket = null;

	while (true) {
		let idle = true;
		for (let i = 0; i < numComputers; ++i) {
			const computer = computers[i];
			const { packetQueue, program } = computer;

			if (packetQueue.length) idle = false;
			if (program.input.length === 0)
				program.input.push(packetQueue.shift() ?? -1);

			while (stepComputer(program) !== 3);

			if (program.output.length) {
				idle = false;

				while (program.output.length < 3) {
					stepComputer(program);
				}

				const id = program.output.shift();
				const X = program.output.shift();
				const Y = program.output.shift();
				if (id === 255) {
					if (!lastPacket) result[0] = Y;
					lastPacket = [X, Y];
					continue;
				}

				computers[id].packetQueue.push(X, Y);
			}
		}

		if (lastPacket && idle) {
			const [X, Y] = lastPacket;

			packetsSent.push(Y);
			if (packetsSent.indexOf(Y) !== packetsSent.lastIndexOf(Y)) {
				result[1] = Y;
				break;
			}

			computers[0].packetQueue.push(X, Y);
		}
	}

	sendResult();
};
