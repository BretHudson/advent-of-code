export const solution = (input) => {
	const answers = [null, null];

	const TYPE = {
		BROADCASTER: 'b',
		FLIP_FLOP: '%',
		CONJUNCTION: '&',
	};

	const modules = input.split('\n').map((line) => {
		const [prefix, list] = line.split(' -> ');

		const type = prefix[0];
		const name = type === 'b' ? prefix : prefix.slice(1);

		return {
			name,
			prefix,
			list: list.split(', '),
			type,
		};
	});

	const moduleGroups = Object.groupBy(modules, ({ type }) => {
		return type;
	});

	const moduleMap = new Map(modules.map((module) => [module.name, module]));
	const flipFlopState = new Map(
		moduleGroups[TYPE.FLIP_FLOP].map((module) => [module.name, false]),
	);
	const conjunctionMemory = new Map(
		moduleGroups[TYPE.CONJUNCTION].map((module) => {
			const memory = new Map(
				moduleGroups[TYPE.FLIP_FLOP]
					.filter((flipFlopModule) => {
						return flipFlopModule.list.includes(module.name);
					})
					.map((module) => [module.name, false]),
			);
			return [module.name, memory];
		}),
	);

	const queue = [];
	let pulseCount = [0, 0];
	const addToQueue = (name, from, pulse) => {
		++pulseCount[+pulse];
		if (!moduleMap.has(name)) return;
		queue.push({ module: moduleMap.get(name), from, pulse });
	};

	const pushButton = () => {
		addToQueue('broadcaster', 'button', false);

		let i = 0;
		while (queue.length) {
			const { module, from, pulse } = queue.shift();

			let nextPulse = null;
			switch (module.type) {
				case TYPE.BROADCASTER:
					nextPulse = pulse;
					break;
				case TYPE.FLIP_FLOP:
					if (!pulse) {
						nextPulse = !flipFlopState.get(module.name);
						flipFlopState.set(module.name, nextPulse);
					}
					break;
				case TYPE.CONJUNCTION:
					const memory = conjunctionMemory.get(module.name);
					memory.set(from, pulse);
					const allOn = [...memory.values()].every(Boolean);
					nextPulse = !allOn;
					break;
			}

			if (nextPulse !== null) {
				module.list.forEach((out) => {
					addToQueue(out, module.name, nextPulse);
				});
			}
		}
	};

	const allFalse = (map) => map.values().every((v) => v === false);
	let loop = 1000;
	for (let i = 0; i < 1000; ++i) {
		pushButton();

		const flipFlopReset = allFalse(flipFlopState);
		const memoryReset = conjunctionMemory.values().every(allFalse);

		if (flipFlopReset && memoryReset) {
			loop = i + 1;
			break;
		}
	}

	const scale = 1000 / loop;

	answers[0] = pulseCount[0] * pulseCount[1] * scale * scale;

	return answers;
};
