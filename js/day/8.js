importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const inputs = input.split('').map(v => +v);
	
	const size = [25, 6];
	const layerSize = size[0] * size[1];
	
	const layers = inputs.reduce((acc, val, i) => {
		if (i % layerSize === 0) acc.unshift([]);
		acc[0].push(val);
		return acc;
	}, []).map(layer => {
		const result = [...layer];
		result.zeroes = layer.reduce((acc, val) => acc + (val === 0), 0);
		return result;
	});
	
	const fewestZeroLayer = [...layers].sort((a, b) => a.zeroes - b.zeroes)[0];
	
	result[0] = fewestZeroLayer.reduce((acc, val) => {
		switch (val) {
			case 1: ++acc[0]; break;
			case 2: ++acc[1]; break;
			default: break;
		}
		return acc;
	}, [0, 0]).reduce((acc, val) => acc * val, 1);
	
	const imageData = layers.reduce((acc, layer) => {
		return layer.map((pixel, i) => (pixel === 2) ? acc[i] : pixel);
	}, Array.from({ length: layerSize }, v => -1));
	
	result[1] = Array.from({ length: size[1] }, v => []).map((_, i) => {
		return imageData.slice(i * size[0], (i + 1) * size[0]).join('');
	}).join('<br />');
	
	sendResult();
};
