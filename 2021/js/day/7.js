importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split(',').map(v => +v).sort((a, b) => a - b);
	const range = inputs[inputs.length - 1] - inputs[0];
	
	const allHorPos = Array.from({ length: range + 1 }, (_, i) => inputs[0] + i);
	const getLowestFuelCost = (fuelCosts, fuelCalculator = (v => v)) => {
		return allHorPos.map(p => fuelCosts.map((v, i) => fuelCalculator(Math.abs(v - p))))
			.map(v => v.reduce(reduceSum, 0))
			.sort((a, b) => a - b)[0];
	};
	
	result[0] = getLowestFuelCost(inputs);
	result[1] = getLowestFuelCost(inputs, delta => (delta * (delta + 1)) / 2);
	
	sendResult();
};
