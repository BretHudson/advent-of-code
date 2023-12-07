importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n');
	
	const mostCommonBits =
		inputs.map(input => input.split('').map(v => +v || -1))
			.reduce((acc, v) => acc.map((a, i) => a + v[i]), Array.from({ length: inputs[0].length }, v => 0))
			.map(v => +(v >= 0));
	const gammaRate = parseInt(mostCommonBits.join(''), 2);
	const deltaRate = parseInt('1'.repeat(inputs[0].length), 2) ^ gammaRate;
	
	result[0] = gammaRate * deltaRate;
	
	const findRating = (numbers, invert = 0, index = 0) => {
		if (numbers.length === 1) return parseInt(numbers[0], 2);
		
		const bitsToTest = numbers.map(n => +n.substring(index, index + 1));
		const num0s = bitsToTest.filter(b => b === 0).length;
		const num1s = bitsToTest.length - num0s;
		const targetBit = invert ^ (num1s >= num0s ? 1 : 0);
		
		const results = numbers.filter((_, i) => bitsToTest[i] === targetBit);
		return findRating(results, invert, index + 1);
	};
	
	const oxygenGeneratorRating = findRating(inputs);
	const co2ScrubberRating = findRating(inputs, 1);
	
	result[1] = oxygenGeneratorRating * co2ScrubberRating;
	
	sendResult();
};
