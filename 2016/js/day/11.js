importScripts('baseWorker.js');
onmessage = onmessagefunc(11, 'Radioisotope Thermoelectric Generators', (input, callback) => {
	let result = [ 'Day 11 incomplete', 'Will finish later' ];
	callback(result);
});