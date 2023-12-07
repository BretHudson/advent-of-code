importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	let layers = [];
	let finalDepth;
	input.split('\n').forEach(line => {
		let [ depth, range ] = line.split(': ');
		layers[finalDepth = +depth] = +range;
	});
	
	const isCaught = (depth, t) => (t % ((layers[depth] - 1) * 2)) === 0;
	
	let getLayersCaughtIn = () => {
		let caughtLayers = [];
		for (let depth = 0; depth <= finalDepth; ++depth) {
			if (isCaught(depth, depth)) {
				console.log('caught in', depth);
				caughtLayers.push(depth);
			}
		}
		return caughtLayers.reduce((acc, depth) => acc + (depth * layers[depth]), 0);
	};
	
	let getSafeOffset = () => {
		for (let offset = 0; ; ++offset) {
			let safe = true;
			for (let depth = 0; depth <= finalDepth; ++depth) {
				if (isCaught(depth, depth + offset)) {
					safe = false;
					break;
				}
			}
			if (safe === true)
				return offset;
		}
	};
	
	result[0] = getLayersCaughtIn();
	result[1] = getSafeOffset();
	
	callback(result);
});