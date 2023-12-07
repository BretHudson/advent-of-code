importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n').map(v => v.split(''));
	
	const opening = ['(', '[', '{', '<'];
	const closing = [')', ']', '}', '>'];
	
	const syntaxCheckerScores = {
		')': 3,
		']': 57,
		'}': 1197,
		'>': 25137
	};
	
	const autocompleteScores = {
		')': 1,
		']': 2,
		'}': 3,
		'>': 4
	};
	
	const getMatchingClosing = v => closing[opening.indexOf(v)];
	
	const [complete, incomplete] = inputs.map(input => {
		return input.reduce((acc, v, i) => (Array.isArray(acc) === false) ? acc : (
			(opening.some(o => o === v))
				? [v, ...acc]
				: (getMatchingClosing(acc[0]) !== v) ? v : acc.slice(1)
		), []);
	}).partition(v => v.length > 1);
	
	result[0] = incomplete.map(v => syntaxCheckerScores[v]).reduce(reduceSum, 0);
	result[1] =
		complete
			.map(input => input.map(getMatchingClosing))
			.map(v => v.reduce((acc, x) => 5 * acc + autocompleteScores[x], 0))
			.sort((a, b) => a - b)[complete.length >> 1];
	
	sendResult();
};
