importScripts('baseWorker.js');
onmessage = onmessagefunc(9, 'Explosives in Cyberspace', (input, callback) => {
	let result = [ null, null ];
	
	String.prototype.replaceAt = function(i, len, str) {
		return this.substring(0, i) + str + this.substring(i + len);
	};
	
	let getPairFromMatch = (str, matches) => {
		let lengthOfMarker = +matches[0].length;
		let numLetters = +matches[1];
		let strIndex = matches.index + lengthOfMarker;
		return {
			index: matches.index,
			marker: matches[0],
			str: str.substring(strIndex, strIndex + numLetters),
			letters: numLetters,
			repeat: +matches[2]
		};
	};
	
	let recursive = (pair, iter) => {
		let inside = 0;
		let str = pair.str;
		let regex = /\((\d+)x(\d+)\)/;
		let matches;
		while (matches = regex.exec(str)) {
			let subPair = getPairFromMatch(str, matches);
			str = str.replace(subPair.marker + subPair.str, '');
			inside += recursive(subPair, ++iter);
		}
		return (inside || pair.letters) * pair.repeat;
	};
	
	let pairs = [];
	
	let regex = /\((\d+)x(\d+)\)/;
	let matches;
	while (matches = regex.exec(input)) {
		pair = getPairFromMatch(input, matches);
		pairs.push(pair);
		input = input.replace(pair.marker + pair.str, '');
	}
	
	result[0] = pairs.reduce((acc, val) => acc + val.str.repeat(val.repeat).length, input.length);
	result[1] = pairs.reduce((acc, val) => acc + recursive(val, 0), input.length);
	
	callback(result);
});