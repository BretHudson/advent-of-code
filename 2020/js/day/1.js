importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n').map(v => +v).sort((a, b) => b - a);
	
	// NOTE(bret): Here's the brute-force method I used to attempt placing on the leaderboard
	const bruteForce = () => {
		inputs.forEach((input, i) => {
			inputs.forEach((input2, j) => {
				if (i === j) return;
				if (input + input2 === 2020)
					result[0] = input * input2;
				inputs.forEach((input3, k) => {
					if (i === k) return;
					if (input + input2 + input3 === 2020)
						result[1] = input * input2 * input3;
				});
			});
		});
	};
	
	const combinations = inputs.combinations(2).sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
	const validPairs = combinations.filter(([a, b]) => a + b <= 2020);
	
	result[0] = validPairs[validPairs.length - 1].reduce((acc, v) => acc * v, 1);
	
	result[1] = inputs.reduce((acc, input) => {
		return acc || validPairs.find(([a, b]) => {
			return ((a !== input) && (b !== input) && (a + b + input) === 2020);
		})?.reduce((acc, v) => acc * v, input);
	}, null);
	
	sendResult();
};
