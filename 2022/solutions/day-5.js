export const solution = (input) => {
	const answers = [null, null];

	const [drawing, procedure] = input.split('\n\n');

	const lines = drawing.split('\n');
	const ids = lines.pop();
	const stackCount = (ids.length + 1) / 4;
	const stacks1 = Array.from({ length: stackCount }, () => []);
	const stacks2 = Array.from({ length: stackCount }, () => []);

	lines.reverse().forEach((line) => {
		for (let i = 0; i < stackCount; ++i) {
			let start = i * 4;
			const item = line.substring(start + 1, start + 2);
			if (item.trim() === '') continue;

			stacks1[i].push(item);
			stacks2[i].push(item);
		}
	});

	const regex = /move (?<count>\d+) from (?<src>\d+) to (?<dst>\d+)/;
	const instructions = procedure.split('\n').map((line) => {
		const { count, src, dst } = regex.exec(line).groups;
		return { count: +count, src: +src, dst: +dst };
	});

	instructions.forEach(({ count, src, dst }) => {
		for (let i = 0; i < count; ++i) {
			stacks1[dst - 1].push(stacks1[src - 1].pop());
		}

		stacks2[dst - 1].push(...stacks2[src - 1].splice(-count));
	});

	answers[0] = stacks1.reduce((acc, stack) => acc + stack.at(-1), '');
	answers[1] = stacks2.reduce((acc, stack) => acc + stack.at(-1), '');

	return answers;
};
