importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const answers = input.split('\n\n').map(group => {
		const people = group.split(/\n/ig);
		
		const result = Object.entries(people.reduce((acc, person) => {
			return person.split('').reduce((acc, val) => {
				return ((acc[val] = (acc[val] || 0) + 1), acc);
			}, acc);
		}, {}));
		
		result.peopleCount = people.length;
		
		return result;
	});
	
	const filterAnswers = ([key]) => key.length === 1;
	
	result[0] = answers.map(group => {
		return group.filter(filterAnswers).reduce((acc, [, val]) => acc + !!val, 0);
	}).reduce(reduceSum, 0);
	
	result[1] = answers.map(group => {
		return group.filter(filterAnswers).filter(([, val]) => val === group.peopleCount).length;
	}).reduce(reduceSum, 0);
	
	sendResult();
};
