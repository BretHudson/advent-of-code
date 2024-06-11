export const solution = (input) => {
	const answers = [null, null];

	const TYPE = {
		BROADCASTER: 'b',
		FLIP_FLOP: '%',
		CONJUNCTION: '&',
	};

	const modules = input.split('\n').map((line) => {
		const [prefix, listStr] = line.split(' -> ');
		const list = listStr.split(', ');

		const type = prefix[0];
		const name = type === 'b' ? prefix : prefix.slice(1);

		return { name, prefix, list, type };
	});

	const moduleGroups = Object.groupBy(modules, ({ type }) => type);

	const moduleMap = new Map(modules.map((module) => [module.name, module]));
	const flipFlopState = new Map(
		moduleGroups[TYPE.FLIP_FLOP].map((module) => [module.name, false]),
	);
	const conjunctionMemory = new Map(
		moduleGroups[TYPE.CONJUNCTION].map((module) => {
			const memory = new Map(
				modules
					.filter((flipFlopModule) => {
						return flipFlopModule.list.includes(module.name);
					})
					.map((module) => [module.name, false]),
			);
			return [module.name, memory];
		}),
	);

	const target = 'rx';
	const findFeeders = (target) => {
		return modules
			.filter((module) => module.list.includes(target))
			.map(({ name }) => name);
	};

	const rxFeed = findFeeders(target)[0];
	const rxFeedFeeds = findFeeders(rxFeed);
	const feedHits = Array.from({ length: rxFeedFeeds.length });

	const queue = [];
	let buttonPresses = 0;
	let pulseCount = [0, 0];
	const addToQueue = (name, from, pulse) => {
		if (!pulse && rxFeedFeeds.includes(name)) {
			feedHits[rxFeedFeeds.indexOf(name)] = buttonPresses;
		}

		++pulseCount[+pulse];
		if (!moduleMap.has(name)) return;
		queue.push({ module: moduleMap.get(name), from, pulse });
	};

	const pushButton = () => {
		++buttonPresses;
		addToQueue('broadcaster', 'button', false);

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

	for (let i = 0; i < 1000; ++i) {
		pushButton();
	}

	answers[0] = pulseCount[0] * pulseCount[1];

	while (true) {
		pushButton();
		if (feedHits.reduce((acc, val) => acc * val, 1)) break;
	}

	answers[1] = feedHits.reduce((acc, val) => {
		const gcd = (a, b) => (b ? gcd(b, a % b) : a);
		return (acc * val) / gcd(acc, val);
	}, 1);

	return answers;
};
