importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n').map(v => v.split(''));
	const width = inputs[0].length, height = inputs.length;
	
	const cloneSeats = seats => seats.map(v => [...v]);
	
	const directions = [
		[-1, -1], [ 0, -1], [ 1, -1],
		[-1,  0],           [ 1,  0],
		[-1,  1], [ 0,  1], [ 1,  1]
	];
	
	const seatsToString = seats => seats.map(row => row.join('')).join('\n');
	
	const addDelta = delta => (v, i) => v + delta[i];
	
	const findOccupiedSeatsAdj = (seats, pos) => {
		return directions.filter((delta) => {
			const [x, y] = pos.map(addDelta(delta));
			return (x >= 0) && (y >= 0) && (x < width) && (y < height) && (seats[y][x] === '#');
		}).length;
	};
	
	const findOccupiedSeatsVisible = (seats, pos) => {
		return directions.filter(delta => {
			let [x, y] = pos.map(addDelta(delta));
			while ((x >= 0) && (y >= 0) && (x < width) && (y < height)) {
				switch (seats[y][x]) {
					case '#': return true;
					case 'L': return false;
					default: [x, y] = [x, y].map(addDelta(delta)); break;
				}
			}
			return false;
		}).length;
	};
	
	const findOccupiedSeats = findOccupiedSeatsAdj;
	const findEquilibrium = (visibleForEmpty, findOccupiedSeats) => {
		let last = null, seats = inputs;
		do
		{
			changed = 0;
			last = seats, seats = cloneSeats(seats);
			for (let y = 0; y < height; ++y) {
				const row = seats[y];
				for (let x = 0; x < width; ++x) {
					switch (row[x]) {
						case 'L': {
							if (findOccupiedSeats(last, [x, y]) === 0) {
								row[x] = '#';
								++changed;
							}
						} break;
						
						case '#': {
							if (findOccupiedSeats(last, [x, y]) >= visibleForEmpty) {
								row[x] = 'L';
								++changed;
							}
						} break;
					}
				}
			}
		} while (changed !== 0);
		
		return seats.reduce((acc, row) => acc + row.filter(v => v === '#').length, 0);
	};
	
	result[0] = findEquilibrium(4, findOccupiedSeatsAdj);
	result[1] = findEquilibrium(5, findOccupiedSeatsVisible);
	
	sendResult();
};
