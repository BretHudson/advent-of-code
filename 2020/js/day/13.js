importScripts('./../util.js');

Number.prototype.mod = function(n) {
    return ((this % n) + n) % n;
};

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const [departure, ids] = input.split('\n').map(v => v.split(',').map(v => isNaN(v) ? v : +v ));
	const buses = ids.map((bus, i) => [bus, i]).filter(([bus]) => bus !== 'x').sort(([a], [b]) => b - a);
	
	const firstBus = buses.map(([id]) => ({ id, wait: id - (departure % id) })).sort((a, b) => a.wait - b.wait)[0];
	
	const findNextN = (n, step, id, offset) => {
		if ((n + offset) % id === 0) return { n, step: step * id };
		return findNextN(n + step, step, id, offset);
	};
	
	result[0] = firstBus.id * firstBus.wait;
	result[1] = buses.reduce(({ n, step }, [id, offset]) => {
		for (; (n + offset) % id !== 0; n += step);
		return { n, step: step * id };
	}, { n: 0, step: 1 }).n;
	result[2] = buses.reduce(({ n, step }, val) => findNextN(n, step, ...val), { n: 0, step: 1 }).n;
	
	const getGCD = (a, b, x0 = 0, x1 = 1, y0 = 1, y1 = 0) => {
		while (a !== 0) {
			const q = Math.trunc(b / a);
			
			[a, b] = [b.mod(a), a];
			
			[y0, y1] = [y1, y0 - q * y1];
			
			[x0, x1] = [x1, x0 - q * x1];
		}
		
		return [x0, y0];
	};
	
	const [mod, n] = buses.slice(1).reduce(([n1, a1], [n2, a2]) => {
		console.log({ a1, n1 });
		const [m1, m2] = getGCD(n1, n2);
		
		const x = (a1 * m2 * n2) + (a2 * m1 * n1);
		const n = n1 * n2;
		
		return [n, x.mod(n)];
	}, buses[0]);
	
	console.log({ n, mod });
	
	result.push('----------------------');
	result.push(mod - n.mod(mod));
	result.push(mod - n % mod);
	result.push(mod - n);
	
	// console.table(rows);
	
	sendResult();
};
