importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const part1Days = 80, part2Days = 256;
	
	const fish = input.split(',').map(v => +v).reduce((acc, i) => (++acc[i], acc), Array.from({ length: 9 }, () => 0));
	
	const { counts } = Array.from({ length: part2Days + 1 }).reduce(({ fish, counts }) => ({
		counts: [...counts, fish.reduce(reduceSum, 0)],
		fish: [...fish.slice(1, 7), fish[7] + fish[0], fish[8], fish[0]]
	}), {
		counts: [],
		fish
	});
	
	result[0] = counts[part1Days];
	result[1] = counts[part2Days];
	
	sendResult();
};
