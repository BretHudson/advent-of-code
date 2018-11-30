importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	let registers = {};
	let highest = 0;
	let regex = /(\w+) (\w+) (-?\d+) if (\w+) ([\<\>\=\!]{1,3}) (-?\d+)/;
	let matches;
	let getRegistryValue = (registry) => registers[registry] = registers[registry] || 0;
	input.split('\n').forEach(line => {
		[ m, modReg, action, amount, ifReg, comparison, compVal ] = regex.exec(line);
		
		switch (comparison) {
			case '>':	if (!(getRegistryValue(ifReg) >  +compVal)) return; break;
			case '<':	if (!(getRegistryValue(ifReg) <  +compVal)) return; break;
			case '>=':	if (!(getRegistryValue(ifReg) >= +compVal)) return; break;
			case '<=':	if (!(getRegistryValue(ifReg) <= +compVal)) return; break;
			case '==':	if (!(getRegistryValue(ifReg) == +compVal)) return; break;
			case '!=':	if (!(getRegistryValue(ifReg) != +compVal)) return; break;
		}
		amount = (action === 'inc') ? +amount : -amount;
		registers[modReg] = getRegistryValue(modReg) + amount;
		if (highest < registers[modReg])
			highest = registers[modReg];
	});
	
	result[0] = Object.values(registers).reduce((acc, val) => (acc > val) ? acc : val, Number.MIN_SAFE_INTEGER);
	result[1] = highest;
	
	callback(result);
});