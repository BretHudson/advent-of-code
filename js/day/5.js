importScripts('baseWorker.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/spark-md5/3.0.0/spark-md5.min.js');
onmessage = onmessagefunc(5, 'How About a Nice Game of Chess?', (input) => {
	let result = [ '', '--------' ];
	
	const replaceCharAtIndex = (str, i, c) => str.substr(0, i) + c + str.substr(i + 1, 8);
	
	let string = input;
	let door1Index = 0;
	let door2Index = 0;
	let index = 0;
	let hash;
	for (; (door1Index < 8) || (result[1].indexOf('-') > -1); ++index) {
		hash = SparkMD5.hash(string + index);
		if (hash.indexOf('00000') === 0) {
			if (door1Index < 8) {
				result[0] += hash.charAt(5);
				++door1Index;
			}
			door2Index = parseInt(hash.charAt(5), 10);
			if ((door2Index < 8) && (result[1].charAt(door2Index) === '-'))
				result[1] = replaceCharAtIndex(result[1], door2Index, hash.charAt(6));
		}
		
		if (index % 20000 === 0) {
			postMessage({
				msg: 'result',
				result: [
					(result[0] + hash).substring(0, 8),
					result[1].split('').map((val, index) => (val === '-') ? hash.charAt(index + 8) : val).join('')
				]
			});
		}
	}
	
	return result;
});