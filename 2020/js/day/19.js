importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const [rulesStr, messages] = input
		.split('\n\n')
		.map((line) => line.split('\n'));

	const parseSubRules = (str) => {
		const [index, subRulesStr] = str.split(': ');
		const subRules = subRulesStr.startsWith('"')
			? JSON.parse(subRulesStr)
			: subRulesStr.split(' | ').map((rule) => {
					return rule.split(' ').map((v) => +v || v);
			  });
		return [index, subRules];
	};

	const rules = Object.fromEntries(rulesStr.map(parseSubRules));

	const validateMessage = (message, rule) => {
		return message
			.map((m) => (m.at(0) === rule ? m.slice(1) : null))
			.filter((m) => m !== null);
	};

	const checkRule = (message, ruleList) => {
		return Array.isArray(ruleList)
			? ruleList.flatMap((subRules) => {
					return subRules.reduce((acc, subRule) => {
						return acc.length
							? checkRule(acc, rules[subRule])
							: acc;
					}, message);
			  })
			: validateMessage(message, ruleList);
	};

	const validateMessages = () => {
		return messages
			.map((message) => checkRule([message], rules[0]))
			.filter((message) => message.some((m) => !m.length)).length;
	};

	result[0] = validateMessages();

	const newRules = Object.fromEntries(
		['8: 42 | 42 8', '11: 42 31 | 42 11 31'].map(parseSubRules),
	);
	Object.assign(rules, newRules);

	result[1] = validateMessages();

	sendResult();
};
