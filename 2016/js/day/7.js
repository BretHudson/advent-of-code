importScripts('baseWorker.js');
onmessage = onmessagefunc(6, 'Internet Protocol Version 7', (input, callback) => {
	let result = [ null, null ];
	
	let lines = input.split('\n').map(line => {
		let matches;
		let inside = '';
		for (;;) {
			matches = /\[\w+\]/g.exec(line);
			if (matches) {
				line = line.replace(matches[0], ',');
				inside += matches[0];
			} else
				break;
		}
		return { outside: line, inside: inside };
	});
	
	result[0] = lines.filter(line => {
		let regexABBA = /(\w)(\w)(?!\1)\2\1/;
		return (regexABBA.test(line.outside)) && (!regexABBA.test(line.inside));
	}).length;
	
	result[1] = lines.filter(line => {
		let matches;
		let regexABA = /(?=((?<a>\w)(?!\k<a>)(?<b>\w)\k<a>))\w/g;
		for (;;) {
			matches = regexABA.exec(line.outside);
			if (matches) {
				let bab = matches.groups.b + matches.groups.a + matches.groups.b;
				if (line.inside.indexOf(bab) > -1)
					return true;
			} else
				break;
		}
		return false;
	}).length;
	
	callback(result);
});

/// First solution, realized we could make this much simpler
// Took on average 35ms to compute, versus the finale solution's 3.5ms
/*result[0] = input.split('\n').filter(line => {
	let numMatches = 0;
	let regexABBA = /((\[)?(\w+)?(?<o>\w)(?<i>\w)(?!\k<o>)\k<i>\k<o>(\w+)?(\])?)/g;
	let matches;
	do {
		matches = regexABBA.exec(line);
		if (matches) {
			if (matches[0].indexOf('[') > -1)
				return false;
			++numMatches;
		}
	} while (matches);
	return (numMatches > 0);
}).length;*/
