importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const lines = input.split('\n').map(line => line.split(' -> ').map(coord => coord.split(',').map(v => +v)));
	
	const perpLines = lines.filter(([[x1, y1], [x2, y2]]) => x1 === x2 || y1 === y2);
	
	const getOverlappingPoints = lines => {
		const points = lines.map(([[x1, y1], [x2, y2]]) => {
			const xDir = Math.sign(x2 - x1), yDir = Math.sign(y2 - y1);
			const length = Math.abs((x2 - x1) || (y2 - y1)) + 1;
			return Array.from({ length }, (_, i) => [
				x1 + i * xDir,
				y1 + i * yDir
			].join(','));
		}).flat().reduce((acc, point) => (acc.set(point, (acc.get(point) ?? 0) + 1), acc), new Map());
		return [...points].filter(([k, v]) => v >= 2).length;
	};
	
	result[0] = getOverlappingPoints(perpLines);
	result[1] = getOverlappingPoints(lines);
	
	sendResult();
};
