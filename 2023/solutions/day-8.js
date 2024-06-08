export const solution = (input) => {
	const answers = [null, null];

	const [pathInput, nodesInput] = input.split('\n\n');

	const nodes = Object.fromEntries(
		nodesInput.split('\n').map((line) => {
			const { name, left, right } = line.match(
				/(?<name>\w{3}) = \((?<left>\w{3}), (?<right>\w{3})\)/,
			).groups;
			return [name, [left, right]];
		}),
	);

	// find all the nodes that end with A
	const starts = Object.keys(nodes)
		.filter((a) => a.endsWith('A'))
		.sort(); // sort so 'AAA' is first

	const path = pathInput.split('').map((v) => (v === 'R' ? 1 : 0));
	const steps = starts.map((start) => {
		let i = 0;
		let curNode = nodes[start];
		while (true) {
			const dir = path[i++ % path.length];
			const nextNodeName = curNode[dir];
			if (nextNodeName.endsWith('Z')) break;
			curNode = nodes[nextNodeName];
		}
		return i;
	});

	answers[0] = steps[0];

	const factors = steps.map((n) => {
		let factors = [];
		for (let i = 2; i < n; ++i) {
			while (n % i === 0) {
				factors.push(i);
				n /= i;
			}
		}
		return factors;
	});

	const factorSum = factors.reduce((a, v) => a * v, 1);
	let i = 1;
	while (true) {
		const target = factorSum * i;
		if (steps.every((s) => target % s === 0)) {
			answers[1] = target;
			break;
		}
		++i;
	}

	return answers;
};
