importScripts('baseWorker.js');
onmessage = onmessagefunc(0, 'TITLE HERE', (input, callback) => {
	let result = [ null, null ];
	callback(result);
});
