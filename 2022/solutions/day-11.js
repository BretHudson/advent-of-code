export const solution = (input) => {
	const answers = [null, null];

	const regex = /(\d+)/g;
	function* getNumbers(str) {
		let matches;
		while ((matches = regex.exec(str))) {
			yield +matches[1];
		}
	}

	const monkeys = input.split('\n\n').map((str) => {
		const [_, itemsStr, opStr, testStr, successStr, failureStr] = str
			.split('\n')
			.map((line) => line.split(': ')[1]);

		const startingItems = [...getNumbers(itemsStr)];
		const op = opStr.split(' = ')[1].split(' ').slice(1);
		const test = [...getNumbers(testStr)][0];
		const success = [...getNumbers(successStr)][0];
		const failure = [...getNumbers(failureStr)][0];

		return { startingItems, op, test, success, failure };
	});

	const testComposite = monkeys.reduce((acc, { test }) => acc * test, 1);

	const execute = (rounds, cooldown) => {
		monkeys.forEach((monkey) => {
			monkey.items = [...monkey.startingItems];
			monkey.inspections = 0;
		});

		for (let round = 0; round < rounds; ++round) {
			for (let m = 0, n = monkeys.length; m < n; ++m) {
				const monkey = monkeys[m];
				const { items, op, test, success, failure } = monkey;

				while (items.length) {
					let worryLevel = items.shift();
					++monkey.inspections;

					const opVal = op[1] === 'old' ? worryLevel : +op[1];
					if (op[0] === '+') worryLevel += opVal;
					else worryLevel *= opVal;

					if (cooldown) worryLevel = Math.floor(worryLevel / 3);

					const nextMonkey =
						worryLevel % test === 0 ? success : failure;
					monkeys[nextMonkey].items.push(worryLevel % testComposite);
				}
			}
		}

		const inspectionCounts = monkeys.map(({ inspections }) => inspections);
		inspectionCounts.sort((a, b) => b - a);
		return inspectionCounts[0] * inspectionCounts[1];
	};

	answers[0] = execute(20, true);
	answers[1] = execute(10000, false);

	return answers;
};
