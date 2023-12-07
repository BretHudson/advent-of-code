importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n'), bredth = inputs[0].length;

	const treesPerSlope = [
		[1, 1],
		[3, 1],
		[5, 1],
		[7, 1],
		[1, 2]
	].map(([deltaX, deltaY]) => {
		const iterations = Array.from({ length: Math.floor(inputs.length / deltaY) });
		const { trees } = iterations.reduce(({ x, y, trees }, test) => ({
			x: x + deltaX,
			y: y + deltaY,
			trees: trees + (inputs[y][x % bredth] === '#')
		}), { x: 0, y: 0, trees: 0 });
		return trees;
	});
	
	result[0] = treesPerSlope[1];
	result[1] = treesPerSlope.reduce((acc, v) => acc * v, 1);
	
	sendResult();
};
