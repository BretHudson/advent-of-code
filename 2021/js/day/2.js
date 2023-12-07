importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n').map(v => {
		const [command, units] = v.split(' ');
		return [command, +units]
	});
	
	result[0] = inputs.reduce(([x, y], [command, units]) => {
		switch (command) {
			case 'forward': return [x + units, y];
			case 'up': return [x, y - units];
			case 'down': return [x, y + units];
		}
	}, [0, 0]).reduce(reduceProduct);
	
	result[1] = inputs.reduce(([x, y, aim], [command, units]) => {
		switch (command) {
			case 'forward': return [x + units, y + aim * units, aim];
			case 'up': return [x, y, aim - units];
			case 'down': return [x, y, aim + units];
		}
	}, [0, 0, 0]).splice(0, 2).reduce(reduceProduct);
	
	sendResult();
};
