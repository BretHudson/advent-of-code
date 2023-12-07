importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const bounds = input.split('-').map(v => +v);
	
	const checkRequirements1 = password => {
		let lastDigit = password % 10;
		let hasMatch = false;
		let onlyIncrease = true;
		for (let p = Math.floor(password / 10); p; p = Math.floor(p / 10)) {
			const digit = p % 10;
			hasMatch = hasMatch || (digit === lastDigit);
			if (lastDigit < digit) {
				onlyIncrease = false;
				break;
			}
			lastDigit = digit;
		}
		
		return hasMatch && onlyIncrease;
	};
	
	const checkRequirements2 = password => {
		const regex = /([0-9])\1{1,}/g;
		const hasOnlyDoubleMatch =
			[...password.toString().matchAll(regex)]
				.filter(m => m[0].length === 2)
				.length > 0;
		return hasOnlyDoubleMatch;
	}
	
	let passwordsPassingReqs1 = 0;
	let passwordsPassingReqs2 = 0;
	for (let password = bounds[0]; password <= bounds[1]; ++password) {
		if (checkRequirements1(password)) {
			++passwordsPassingReqs1;
			if (checkRequirements2(password))
				++passwordsPassingReqs2;
		}
	}
	
	result[0] = passwordsPassingReqs1;
	result[1] = passwordsPassingReqs2;
	
	sendResult();
};