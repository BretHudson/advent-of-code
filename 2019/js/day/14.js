importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const reactionsMap = Object.fromEntries(
		input
			.split('\n')
			.map((line) => {
				const [a, b] = line.split(' => ');

				const inputs = a.split(', ').map((input) => {
					const [quantity, chemical] = input.split(' ');
					return [chemical, +quantity];
				});
				const [quantity, output] = b.split(' ');

				return [output, { type: output, quantity: +quantity, inputs }];
			})
			.concat([['ORE', { type: 'ORE', quantity: 1, inputs: [] }]]),
	);

	const reactions = Object.values(reactionsMap);

	const queue = [...reactions];

	while (queue.length) {
		const cur = queue.shift();
		const childLevels = cur.inputs.map(([k]) => reactionsMap[k].level);
		if (childLevels.every((level) => level !== undefined)) {
			const maxChildLevel = Math.max(-1, ...childLevels);
			cur.level = maxChildLevel + 1;
		} else {
			queue.push(cur);
		}
	}

	const maxLevel = Math.max(...reactions.map(({ level }) => level));

	const levels = reactions
		.reduce(
			(acc, chem) => {
				acc[chem.level]?.push(chem);
				return acc;
			},
			Array.from({ length: maxLevel + 1 }, () => []),
		)
		.reverse();

	const compute = (fuel) => {
		const need = Object.fromEntries(
			Object.keys(reactionsMap).map((k) => [k, k === 'FUEL' ? fuel : 0]),
		);
		levels.forEach((level) => {
			level.forEach((chem) => {
				const toGenerate =
					Math.ceil(need[chem.type] / chem.quantity) * chem.quantity;
				chem.inputs.forEach(([c, q]) => {
					need[c] += q * Math.floor(toGenerate / chem.quantity);
				});
			});
		});
		return need['ORE'];
	};

	const oreRequiredForFuel = compute(1);
	result[0] = oreRequiredForFuel;

	const target = 1000000000000;
	let fuel = Math.ceil(target / oreRequiredForFuel);
	let dist = 2 ** Math.log2(target - fuel);
	fuel += dist >> 1;
	while (dist > 1) {
		const halfDist = Math.floor(dist / 2);
		dist = halfDist;
		if (compute(fuel) >= target) fuel -= halfDist;
		else fuel += halfDist;
	}

	while (compute(fuel) > target) --fuel;

	result[1] = fuel;

	sendResult();
};
