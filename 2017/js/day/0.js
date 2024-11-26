importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	
	
	result[0] = null;
	result[1] = null;
	
	callback(result);
});
