importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n');
	
	const newObject = (acc, name) => {
		acc[name] ??= { name, orbits: 0, orbiting: null, children: [] };
		return acc[name];
	};
	
	const objects = inputs.map(input => input.split(')').reverse())
		.reduce((acc, [a, b]) => {
			const object = newObject(acc, a);
			const orbiting = newObject(acc, b);
			orbiting.children.push(object);
			return acc;
		}, {});
	
	Object.entries(objects).forEach(([k, object]) => {
		object.children.forEach(orbitee => {
			orbitee.orbiting = object;
		});
	});
	
	let level = 0;
	const queues = [[objects['COM']], []];
	let queue, nextQueue;
	
	while ((queue = queues[level % 2]).length > 0) {
		nextQueue = queues[(level + 1) % 2];
		nextQueue.push(...queue.reduce((acc, object) => {
			object.orbits = level;
			acc.push(...object.children);
			return acc;
		}, []));
		queue.splice(0, queue.length);
		++level;
	}
	
	result[0] = Object.values(objects).reduce((acc, o) => acc + o.orbits, 0);
	
	const you = objects['YOU'];
	const san = objects['SAN'];
	
	const constructPathToCom = start => {
		const goal = objects['COM'];
		const path = [];
		for (let cur = start; cur !== goal; path.push(cur = cur.orbiting));
		return path;
	};
	
	const comToYou = constructPathToCom(you).reverse();
	const comToSan = constructPathToCom(san).reverse();
	
	while (comToYou[0] === comToSan[0]) {
		comToYou.shift();
		comToSan.shift();
	}
	
	result[1] = comToYou.length + comToSan.length;
	
	sendResult();
};
