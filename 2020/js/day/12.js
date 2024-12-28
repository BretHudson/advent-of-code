importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n');
	
	const dirs = ['E', 'S', 'W', 'N'];
	
	const move = (acc, { action, value }) => {
		const { dir, x, y } = acc;
		switch (action) {
			case 'N': return { dir, x, y: y + value };
			case 'S': return { dir, x, y: y - value };
			case 'E': return { dir, x: x + value, y };
			case 'W': return { dir, x: x - value, y };
			case 'L': return { dir: ((dir + 4) - (value / 90)) % 4, x, y };
			case 'R': return { dir: ((dir + 4) + (value / 90)) % 4, x, y };
			case 'F': return move(acc, { action: dirs[dir], value });
		}
	};
	
	const rotateWaypoint = (wX, wY, amount) => {
		amount = ((amount + 360) / 90) % 4;
		[wX, wY] = Array.from({ length: amount }).reduce(([wX, wY]) => [wX, wY] = [wY, -wX], [wX, wY]);
		return { wX, wY };
	};
	
	const moveWithWaypoint = (acc, { action, value }) => {
		const { sX, sY, wX, wY } = acc;
		switch (action) {
			case 'N': return { sX, sY, wX, wY: wY + value };
			case 'S': return { sX, sY, wX, wY: wY - value };
			case 'E': return { sX, sY, wX: wX + value, wY };
			case 'W': return { sX, sY, wX: wX - value, wY };
			case 'L': return { sX, sY, ...rotateWaypoint(wX, wY, -value) };
			case 'R': return { sX, sY, ...rotateWaypoint(wX, wY, value) };
			case 'F': return { sX: sX + value * wX, sY: sY + value * wY, wX, wY };
			default: return { sX, sY, wX, wY };
		}
	};
	
	const getManhattanDistance = ([x, y]) => Math.abs(x) + Math.abs(y);
	
	const part1 = inputs.reduce(move, { dir: 0, x: 0, y: 0 });
	const part2 = inputs.reduce(moveWithWaypoint, { sX: 0, sY: 0, wX: 10, wY: 1 });
	
	result[0] = getManhattanDistance([part1.x, part1.y]);
	result[1] = getManhattanDistance([part2.sX, part2.sY]);
	
	sendResult();
};
