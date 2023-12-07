importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, 0 ];
	
	let inc = 0;
	result[0] = str = input.replace(/!./g, '').replace(/<(?:[<\w\'\"\s\,{}]+)?>/g, (match) => {
		result[1] += match.length - 2;
	}).split('').reduce((score, val) => {
		if (val === '{') ++inc;
		if (val === '}') score += inc--;
		return score;
	}, 0);
	
	callback(result);
});