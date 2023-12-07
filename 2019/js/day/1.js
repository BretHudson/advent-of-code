importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('\n').map(i => +i);
	
	const findFuel = mass => Math.floor(mass / 3) - 2;
	const findFuelRec = mass => {
		const fuel = findFuel(mass);
		if (fuel <= 0) return 0;
		return fuel + findFuelRec(fuel);
	};
	
	result[0] = inputs.reduce((acc, i) => acc + findFuel(i), 0);
	result[1] = inputs.reduce((acc, i) => acc + findFuelRec(i), 0);
	
	sendResult();
};