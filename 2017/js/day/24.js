importScripts('./../baseWorker.js');

onmessage = onmessagefunc((input, callback) => {
	let result = [null, null];

	let parts = input.split('\n').map((line) => line.split('/').map(Number));

	function* buildBridges(openPort, parts, spareParts) {
		for (let part of spareParts) {
			let [a, b] = part;
			if (a !== openPort && b !== openPort) continue;

			let nextPort = a === openPort ? b : a;
			let remainingParts = spareParts.filter(
				([oA, oB]) => a !== oA || b !== oB,
			);

			yield* buildBridges(nextPort, [...parts, part], remainingParts);
		}

		yield { parts };
	}

	bridges = [...buildBridges(0, [], parts, 0)];

	bridges.forEach((bridge) => {
		bridge.strength = bridge.parts.reduce((acc, [a, b]) => {
			return acc + a + b;
		}, 0);
	});

	result[0] = bridges.sort((a, b) => b.strength - a.strength)[0].strength;

	result[1] = bridges.sort(
		(a, b) => b.parts.length - a.parts.length || b.strength - a.strength,
	)[0].strength;

	return callback(result);
});
