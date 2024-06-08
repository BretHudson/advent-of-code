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

	const path = pathInput.split('').map((v) => (v === 'R' ? 1 : 0));
	let i = 0;
	let curNode = nodes['AAA'];
	const targetNode = nodes['ZZZ'];
	while (curNode !== targetNode) {
		const dir = path[i++ % path.length];
		const nextNodeName = curNode[dir];
		curNode = nodes[nextNodeName];
	}

	answers[0] = i;

	return answers;
};
