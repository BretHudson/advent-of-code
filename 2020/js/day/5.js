importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n');
	
	const binarySearch = (str, positive) => {
		return str.split('').reduce((acc, dir) => {
			let [low, high] = acc;
			let diff = ((high - low) + 1) / 2;
			if (dir === positive)
				high -= diff;
			else
				low += diff;
			return [low, high];
		}, [0, Math.pow(2, str.length) - 1])[0];
	};
	
	const ids = inputs.map(input => {
		const row = binarySearch(input.substring(0, 7), 'F');
		const col = binarySearch(input.substring(7, 10), 'L');
		return row * 8 + col;
	}).sort((a, b) => b - a);
	
	const seat = ids.filter((v, i, arr) => {
		const next = arr[i + 1];
		return (next !== undefined) && ((v - 1) !== next);
	});
	
	result[0] = ids[0];
	result[1] = seat;
	
	sendResult();
};
