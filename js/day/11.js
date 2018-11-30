importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	let goOnHexAdventure = () => {
		let axes = { x: 0, y: 0, z: 0 };
		let greatestDistance = 0;
		let computeDistance = () => (Math.abs(axes.x) + Math.abs(axes.y) + Math.abs(axes.z)) >> 1;
		let adjustAxes = (x, y, z) => {
			axes.x += x;
			axes.y += y;
			axes.z += z;
		};
		
		input.split(',').forEach(dir => {
			switch (dir) {
				case 'n':	adjustAxes(-1, 1, 0); break;
				case 'ne':	adjustAxes(-1, 0, 1); break;
				case 'se':	adjustAxes(0, -1, 1); break;
				case 's':	adjustAxes(1, -1, 0); break;
				case 'sw':	adjustAxes(1, 0, -1); break;
				case 'nw':	adjustAxes(0, 1, -1); break;
			}
			greatestDistance = Math.max(greatestDistance, computeDistance());
		});
		
		return [ computeDistance(), greatestDistance ];
	};
	
	result = goOnHexAdventure();
	
	callback(result);
});