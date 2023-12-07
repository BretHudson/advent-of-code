importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const wires = input.split('\n').map(w => w.split(',').map(d => {
		const v = d.split('');
		return [v[0], +v.slice(1).join('')];
	}));
	
	const grid = {};
	const stepsGrid = [];
	
	
	wires.forEach((wire, wireId) => {
		const curPos = { x: 0, y: 0 };
		let steps = 0;
		wire.forEach(move => {
			const [dir, amount] = move;
			for (let i = 0; i < amount; ++i) {
				switch (dir) {
					case 'L': --curPos.x; break;
					case 'R': ++curPos.x; break;
					case 'U': --curPos.y; break;
					case 'D': ++curPos.y; break;
				}
				
				const posStr = `${curPos.x},${curPos.y}`;
				grid[posStr] = (grid[posStr] || 0) | (1 << wireId);
				
				stepsGrid[posStr] = Object.assign(stepsGrid[posStr] || {}, {
					[wireId]: ++steps
				});
			}
		});
	});
	
	const overlapped =
		Object.entries(grid)
			.filter(([k, v]) => v === 3)
			.map(([k, v]) => k.split(',').reduce((acc, v) => acc + Math.abs(+v), 0))
			.sort((a, b) => a - b);
	
	result[0] = overlapped[0];
	
	const overlappedSteps =
		Object.entries(stepsGrid)
			.filter(([k, v]) => Object.keys(v).length === 2)
			.map(([k, v]) => Object.values(v).reduce((acc, i) => acc + i, 0))
			.sort((a, b) => a - b);
	
	result[1] = overlappedSteps[0];
	
	sendResult();
};