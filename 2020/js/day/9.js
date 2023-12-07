importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n').map(v => +v);
	
	let preamble = 25;
	
	const soFar = [];
	let allSums = Array.from({ length: preamble }, v => []);
	const invalid = inputs.find((input, index) => {
		if ((soFar.length >= preamble) && (allSums.flat().includes(input) === false))
			return true;
		
		if (soFar.length === preamble) {
			const [first, ...rest] = allSums;
			allSums = [...rest, []];
			soFar.shift();
		}
		
		const sums = soFar.map(v => v + input);
		sums.forEach((input, i) => {
			allSums[i].push(input);
		});
		soFar.push(input);
		return false;
	});
	
	result[0] = invalid;
	
	let min = 0, max = 0, sum = inputs[0];
	
	const findSetThatSumsToTarget = (inputs, target, min, max, sum) => {
		if (sum < invalid) {
			sum += inputs[++max];
			// console.log('adding', inputs[max]);
		} else if (sum > invalid) {
			sum -= inputs[min++];
			// console.log('subing', inputs[min]);
		}
		
		if (Math.max(min, max) > inputs.length)
			break;
		
		if (sum === invalid) {
			let low = Number.POSITIVE_INFINITY, high = 0;
			for (let i = min; i <= max; ++i) {
				const n = inputs[i];
				low = Math.min(n, low);
				high = Math.max(n, high);
			}
			result[1] = Array.from({ length: max - min }).map((_, i) => min + i).reduce((acc, v) => {
				const [low, high] = acc;
				const n = inputs[v];
				return [Math.min(n, low), Math.max(n, high)];
			}, [Number.POSITIVE_INFINITY, 0]).reduce((acc, v) => acc + v, 0);
			// console.log(inputs[min], inputs[max]);
			// console.log(low, high);
			// result[1] = low + high;
			break;
		}
	};
	
	while (true) {
		// console.log(sum);
		if (sum < invalid) {
			sum += inputs[++max];
			// console.log('adding', inputs[max]);
		} else if (sum > invalid) {
			sum -= inputs[min++];
			// console.log('subing', inputs[min]);
		}
		
		if (Math.max(min, max) > inputs.length)
			break;
		
		// console.log(min, max);
		
		if (sum === invalid) {
			let low = Number.POSITIVE_INFINITY, high = 0;
			for (let i = min; i <= max; ++i) {
				const n = inputs[i];
				low = Math.min(n, low);
				high = Math.max(n, high);
			}
			result[1] = Array.from({ length: max - min }).map((_, i) => min + i).reduce((acc, v) => {
				const [low, high] = acc;
				const n = inputs[v];
				return [Math.min(n, low), Math.max(n, high)];
			}, [Number.POSITIVE_INFINITY, 0]).reduce((acc, v) => acc + v, 0);
			// console.log(inputs[min], inputs[max]);
			// console.log(low, high);
			// result[1] = low + high;
			break;
		}
	}
	
	// result[1] = null;
	
	sendResult();
};
