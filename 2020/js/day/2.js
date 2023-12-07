importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n').map(v => {
		const [, min, max, letter, password] = /(\d+)-(\d+) ([a-z]): ([a-z]+)/g.exec(v);
		return { min, max, letter, password };
	});
	
	result[0] = inputs.filter(({ min, max, password, letter }) => {
		const num = password.split('').filter(v => v === letter).length;
		return (num >= min) && (num <= max);
	}).length;
	
	result[1] = inputs.filter(({ min, max, password, letter }) => {
		return (password[min - 1] === letter) ^ (password[max - 1] === letter);
	}).length;
	
	sendResult();
};
