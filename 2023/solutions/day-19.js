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
				return { condition, forward };
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

	const acceptedParts = parts.filter((part) => {
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
	});

	answers[0] = acceptedParts.reduce((acc, part) => {
		return acc + part.x + part.m + part.a + part.s;
	}, 0);

	return answers;
};
