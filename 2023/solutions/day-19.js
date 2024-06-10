export const solution = (input) => {
	const answers = [null, null];

	const [workflowsInput, partsInput] = input.split('\n\n');

	const workflows = Object.fromEntries(
		workflowsInput.split('\n').map((str) => {
			const [name, rulesStr] = str.replace('}', '').split('{');
			const rules = rulesStr.split(',').map((ruleStr) => {
				if (!ruleStr.includes(':'))
					return { condition: () => true, forward: ruleStr };

				const [condStr, forward] = ruleStr.split(':');
				const cat = condStr[0];
				const op = condStr[1];
				const quantity = +condStr.substring(2);
				const condition = (categories) => {
					if (op === '<') return categories[cat] < quantity;
					else return categories[cat] > quantity;
				};
				return { condition, forward, cat, op, quantity };
			});
			return [name, rules];
		}),
	);

	const parts = partsInput.split('\n').map((partStr) => {
		return Object.fromEntries(
			partStr
				.replaceAll(/[{}]/g, '')
				.split(',')
				.map((v) => {
					const [c, q] = v.split('=');
					return [c, +q];
				}),
		);
	});

	const processPart = (part) => {
		let workflow = 'in';
		let i = 0;
		while (workflow !== 'A' && workflow !== 'R') {
			const passed = workflows[workflow].find(({ condition }) =>
				condition(part),
			);
			workflow = passed.forward;
			if (++i > 1000) break;
		}
		return workflow === 'A';
	};

	const acceptedParts = parts.filter(processPart);

	answers[0] = acceptedParts.reduce((acc, part) => {
		return acc + part.x + part.m + part.a + part.s;
	}, 0);

	const initialState = {
		workflow: 'in',
		...Object.fromEntries(['x', 'm', 'a', 's'].map((v) => [v, [1, 4000]])),
	};

	const getRange = ([a, b]) => b - a + 1;

	const queue = [initialState];

	let sum = 0;
	while (queue.length) {
		const { workflow, x, m, a, s } = queue.shift();
		if (workflow === 'R') continue;

		if (workflow === 'A') {
			sum += getRange(x) * getRange(m) * getRange(a) * getRange(s);
			continue;
		}

		const curWorkflow = workflows[workflow];
		const ranges = { x, m, a, s };
		for (let i = 0; i < curWorkflow.length; ++i) {
			const { forward, cat, op, quantity } = curWorkflow[i];
			const c = ranges[cat];
			if (op === '<') {
				if (c[0] < quantity) {
					queue.push({
						x: [...ranges['x']],
						m: [...ranges['m']],
						a: [...ranges['a']],
						s: [...ranges['s']],
						[cat]: [c[0], quantity - 1],
						workflow: forward,
					});
					c[0] = quantity;
				}
			} else if (op === '>') {
				if (c[1] > quantity) {
					queue.push({
						x: [...ranges['x']],
						m: [...ranges['m']],
						a: [...ranges['a']],
						s: [...ranges['s']],
						[cat]: [quantity + 1, c[1]],
						workflow: forward,
					});
					c[1] = quantity;
				}
			} else {
				queue.push({
					...ranges,
					workflow: forward,
				});
			}
		}
	}

	answers[1] = sum;

	return answers;
};
