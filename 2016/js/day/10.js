importScripts('baseWorker.js');
onmessage = onmessagefunc(10, 'Balance Bots', (input, callback) => {
	let result = [ null, null ];
	
	const NULL_HAND = Number.MAX_SAFE_INTEGER;
	let createBot = (id) => {
		if (bots[id] === undefined) {
			bots[id] = {
				id: id,
				hands: [ ],
				low: null, high: null,
				receive: function(val) {
					this.hands.push(val);
					this.hands.sort((a, b) => Math.sign(a - b));
				}
			};
		}
		return bots[id];
	}
	
	let executeBot = (bot) => {
		if (bot.hands.length === 2) {
			if ((bot.hands[0] === 17) && (bot.hands[1] === 61))
				result[0] = bot.id;
			
			if (bot.low.type === 'bot')
				bots[bot.low.id].receive(bot.hands[0]);
			else
				outputs[bot.low.id] = bot.hands[0];
			
			if (bot.high.type === 'bot')
				bots[bot.high.id].receive(bot.hands[1]);
			else
				outputs[bot.high.id] = bot.hands[1];
			
			bot.hands = [];
		}
		return bot.hands.length;
	}
	
	let bots = [ ];
	let outputs = [ ];
	
	let lines = input.split('\n').sort((a, b) => b.charAt(0).localeCompare(a.charAt(0)));
	
	let regexValue = /value (\d+) goes to bot (\d+)/;
	let regexBot = /bot (\d+) gives low to (\w+) (\d+) and high to (\w+) (\d+)/;
	let matches;
	input.split('\n').forEach(line => {
		if (matches = regexValue.exec(line)) {
			createBot(+matches[2]).receive(+matches[1]);
		} else if (matches = regexBot.exec(line)) {
			let bot = createBot(+matches[1]);
			bot.low = { type: matches[2], id: +matches[3] };
			bot.high = { type: matches[4], id: +matches[5] };
		}
	});
	
	while (bots.reduce((acc, bot) => acc += executeBot(bot), 0)) {}
	result[1] = outputs.slice(0, 3).reduce((acc, val) => acc * val, 1);
	
	callback(result);
});