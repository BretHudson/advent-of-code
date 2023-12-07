importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n').map(v => +v);
	
	const calculateIncreases = values => {
		return values.reduce(({ last, increases }, val) => ({
			last: val,
			increases: (val > last) ? increases + 1 : increases,
		}), {
			last: Number.MAX_SAFE_INTEGER,
			increases: 0
		}).increases;
	};
	
	result[0] = calculateIncreases(inputs);
	
	const slidingWindowSums =
		inputs
			.map((input, i, arr) => [input, arr[i + 1], arr[i + 2]].filter(v => v))
			.filter(terms => terms.length === 3)
			.map(terms => terms.reduce(reduceSum));
			
	result[1] = calculateIncreases(slidingWindowSums);
	
	sendResult();
};
