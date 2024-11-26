importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	
	
	result[0] = null;
	result[1] = null;
	
	sendResult();
};
