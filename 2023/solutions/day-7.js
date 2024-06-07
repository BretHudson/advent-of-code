const _types = [
	'FIVE_OF_A_KIND',
	'FOUR_OF_A_KIND',
	'FULL_HOUSE',
	'THREE_OF_A_KIND',
	'TWO_PAIR',
	'ONE_PAIR',
	'HIGH_CARD',
];

const TYPE = Object.fromEntries(_types.map((v, i) => [v, i]));

const CARDS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export const solution = (input) => {
	const answers = [null, null];

	const getType = (cards) => {
		const distributionsMap = cards.reduce((acc, val) => {
			acc[val] ??= 0;
			++acc[val];
			return acc;
		}, {});
		const distributions = Object.values(distributionsMap).sort(
			(a, b) => b - a,
		);
		let dist = null;
		switch (distributions[0]) {
			case 5:
				dist = TYPE.FIVE_OF_A_KIND;
				break;
			case 4:
				dist = TYPE.FOUR_OF_A_KIND;
				break;
			case 3:
				dist =
					distributions.length === 2
						? TYPE.FULL_HOUSE
						: TYPE.THREE_OF_A_KIND;
				break;
			case 2:
				dist =
					distributions.length === 3 ? TYPE.TWO_PAIR : TYPE.ONE_PAIR;
				break;
			case 1:
				dist = TYPE.HIGH_CARD;
				break;
		}
		return dist;
	};

	const hands = input.split('\n').map((line) => {
		const [hand, bid] = line.split(' ');

		const cards = hand.split('');
		const type = getType(cards);
		const typeName = _types[type]; // for easier debugging

		return { hand, cards, bid: +bid, type, typeName };
	});

	hands.sort((a, b) => {
		let diff = a.type - b.type;
		for (let i = 0; !diff && i < a.cards.length; ++i) {
			diff ||= CARDS.indexOf(a.cards[i]) - CARDS.indexOf(b.cards[i]);
		}
		return diff;
	});

	answers[0] = hands.reduce((acc, { bid }, i) => {
		return (acc += bid * (hands.length - i));
	}, 0);

	return answers;
};
