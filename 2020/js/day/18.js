importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const expressions = input.split('\n').map((line) => {
		const characters = line.split('').filter((v) => v !== ' ');
		const stack = [];
		let cur = [];
		for (let i = 0; i < characters.length; ++i) {
			const c = characters[i];
			switch (c) {
				case '(':
					stack.push(cur);
					cur = [];
					break;
				case ')':
					const parent = stack.pop();
					if (parent) {
						parent.push(cur);
						cur = parent;
					}
					break;
				default:
					cur.push(Number.isNaN(+c) ? c : +c);
					break;
			}
		}
		return cur;
	});

	const evaluateExpression = (advanced = false) => {
		const evaluate = (expression) => {
			if (!Array.isArray(expression)) return expression;

			const val = [evaluate(expression[0])];
			for (let i = 1; i < expression.length; i += 2) {
				const op = expression[i];
				const next = evaluate(expression[i + 1]);
				if (op === '+') val[0] += next;
				else {
					if (advanced) val.unshift(next);
					else val[0] *= next;
				}
			}
			return val.reduce((a, v) => a * v, 1);
		};

		return evaluate;
	};

	const evaluate = evaluateExpression();
	const evaluateAdvanced = evaluateExpression(true);

	result[0] = expressions.map(evaluate).reduce((a, v) => a + v, 0);
	result[1] = expressions.map(evaluateAdvanced).reduce((a, v) => a + v, 0);

	sendResult();
};
