importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split(',').map(v => +v);
	
	const computeWithArray = n => {
		const numbers = [];
		
		for (let i = 0; i < n; ++i) {
			if (numbers.length < inputs.length) {
				numbers.unshift(inputs[i]);
				continue;
			}
			
			const [lastNumber, ...rest] = numbers;
			const timesCounted = numbers.filter(n => n === lastNumber).length;
			if (timesCounted === 1) {
				numbers.unshift(0);
				continue;
			}
			
			const nextNumber = rest.indexOf(lastNumber) + 1;
			numbers.unshift(nextNumber);
		}
		
		return numbers[0];
	};
	
	const computeWithMap = n => {
		const numbers = new Map();
		let lastNumber, nextNumber;
		
		inputs.forEach((input, index) => {
			lastNumber = input;
			numbers.set(lastNumber, index);
		});
		
		for (let i = inputs.length; i < n; ++i) {
			nextNumber = numbers.has(lastNumber) ? (i - numbers.get(lastNumber) - 1) : 0;
			numbers.set(lastNumber, i - 1);
			lastNumber = nextNumber;
		}
		
		return lastNumber;
	};
	
	result[0] = computeWithArray(2020);
	result[1] = computeWithMap(30_000_000);
	
	sendResult();
};
