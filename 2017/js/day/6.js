importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	let reallocate = (banks) => {
		banks = banks.map((val, index) => { return { value: +val, index }; });
		let seen = [];
		let sortByValue = (a, b) => Math.sign(b.value - a.value);
		let sortByIndex = (a, b) => Math.sign(a.index - b.index);
		for (let cycle = 0; ; ++cycle) {
			let str = banks.map(bank => bank.value).join(',');
			if (seen.indexOf(str) > -1)
				return [ cycle, seen.length - seen.indexOf(str) ];
			seen.push(str);
			
			let bankToRedis = banks.sort(sortByValue)[0];
			banks.sort(sortByIndex);
			
			let index = bankToRedis.index;
			let blocks = bankToRedis.value;
			bankToRedis.value = 0;
			for (; blocks > 0; --blocks)
				++banks[(++index % banks.length)].value;
		}
	};
	
	result = reallocate(input.split(/\s/));
	
	callback(result);
});