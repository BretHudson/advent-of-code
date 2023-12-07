importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n').map(row => row.split('').map(v => +v)).flat();
	const cols = input.indexOf('\n'), rows = (input.length + 1) / (cols + 1);
	
	const getPos = index => [index % cols, Math.floor(index / cols)];
	const getIndex = (x, y) => ((x >= 0) && (y >= 0) && (x < cols) && (y < rows)) ? y * cols + x : undefined;
	
	const mapAddVectors = (a, b) => a.map((v, i) => v + b[i]);
	const mapGetAdjacentCellIndex = i => pos => getIndex(...mapAddVectors(pos, getPos(i)));
	
	const adjTable = inputs.map((input, i) => {
		const adjacent = [
			[ 0, -1],
			[ 0,  1],
			[-1,  0],
			[ 1,  0]
		].map(mapGetAdjacentCellIndex(i)).filter(p => inputs[p] !== undefined);
		
		return {
			index: i,
			value: input,
			adjacent
		};
	});
	
	const lowest = adjTable.filter(({ value, adjacent }, i) => {
		return adjacent.find(xx => value >= inputs[xx]) === undefined;
	});
	
	const floodFill = (cave, index, id) => {
		if (cave[index] !== null) return cave;
		
		const { value, adjacent } = adjTable[index];
		if (value === -1) return cave;
		
		cave[index] = id;
		return adjacent.reduce((acc, v) => {
			return floodFill(cave, v, id);
		}, cave);
	};
	
	const filledCave = lowest.map(({ index }) => index).reduce(floodFill, inputs.map(v => (v === 9) ? -1 : null));
	
	result[0] = lowest.map(({ value }) => value).map(v => 1 + v).reduce(reduceSum, 0);
	result[1] = Array.from({ length: lowest.length }, (_, i) => {
		return filledCave.filter(c => c === i).length;
	}).sort((a, b) => b - a).slice(0, 3).reduce(reduceProduct, 1);
	
	sendResult();
};
