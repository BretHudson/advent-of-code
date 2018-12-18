importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	let steps = +input;
	let curPos = 0;
	let values = [ 0 ];
	
	for (let i = 1; i <= 2017; ++i) {
		curPos = ((curPos + steps) % i) + 1;
		values.splice(curPos, 0, i);
	}
	
	result[0] = values[curPos + 1];
	
	let answer = 0;
	for (let i = 2018; i <= 50000000; ++i) {
		curPos = ((curPos + steps) % i) + 1;
		if (curPos === 1) answer = i;
	}
	
	result[1] = answer;
	
	callback(result);
});