importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const startingDecks = input.split('\n\n').map((block) => {
		const [_, ...rest] = block.split('\n');
		return rest.map(Number);
	});

	const playCombat = () => {
		const players = startingDecks.map((deck) => [...deck]);
		while (players.every((deck) => deck.length)) {
			const [a, b] = players.map((deck) => deck.shift());
			if (a > b) {
				players[0].push(a, b);
			} else {
				players[1].push(b, a);
			}
		}

		const winner = players.filter((deck) => deck.length)[0].reverse();
		return winner.reduce((acc, v, i) => acc + v * (i + 1), 0);
	};

	const playRecursiveCombat = (players) => {
		const rounds = new Set();

		while (players.every((deck) => deck.length)) {
			const configuration = players
				.map((deck) => deck.join(''))
				.join('|');
			if (rounds.has(configuration)) return 0;
			rounds.add(configuration);

			const cards = [players[0].shift(), players[1].shift()];

			if (cards.every((count, i) => players[i].length >= count)) {
				const winner = playRecursiveCombat([
					players[0].slice(0, cards[0]),
					players[1].slice(0, cards[1]),
				]);
				if (winner) cards.reverse();
				players[winner].push(...cards);
			} else {
				const [a, b] = cards;
				if (a > b) {
					players[0].push(a, b);
				} else {
					players[1].push(b, a);
				}
			}
		}

		const winnerId = players.findIndex((deck) => deck.length);
		if (players !== startingDecks) return winnerId;

		const winner = players[winnerId].reverse();
		return winner.reduce((acc, v, i) => acc + v * (i + 1), 0);
	};

	result[0] = playCombat();
	console.time('test');
	result[1] = playRecursiveCombat(startingDecks);
	console.timeEnd('test');

	sendResult();
};
