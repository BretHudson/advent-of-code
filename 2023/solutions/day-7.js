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

const CARDS_1 = [
	'A',
	'K',
	'Q',
	'J',
	'T',
	'9',
	'8',
	'7',
	'6',
	'5',
	'4',
	'3',
	'2',
];
const CARDS_2 = [
	'A',
	'K',
	'Q',
	'T',
	'9',
	'8',
	'7',
	'6',
	'5',
	'4',
	'3',
	'2',
	'J',
];

export const solution = (input) => {
	const getType = (distributionsMap, wildcard = false) => {
		distributionsMap = { ...distributionsMap };
		let jokers = 0;
		if (wildcard) {
			jokers = distributionsMap['J'] ?? 0;
			delete distributionsMap['J'];
		}
		const distributions = Object.values(distributionsMap).sort(
			(a, b) => b - a,
		);
		distributions[0] += jokers;

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

		const distributions = cards.reduce((acc, val) => {
			acc[val] ??= 0;
			++acc[val];
			return acc;
		}, {});

		const type = [getType(distributions), getType(distributions, true)];

		return {
			hand,
			cards,
			bid: +bid,
			type,
		};
	});

	const sortHands = (cardOrder, index) => (a, b) => {
		let diff = a.type[index] - b.type[index];
		for (let i = 0; !diff && i < a.cards.length; ++i) {
			diff ||=
				cardOrder.indexOf(a.cards[i]) - cardOrder.indexOf(b.cards[i]);
		}
		return diff;
	};

	return [CARDS_1, CARDS_2].map((cards, cardsIndex) => {
		return hands
			.sort(sortHands(cards, cardsIndex))
			.reduce((acc, { bid }, i) => {
				return (acc += bid * (hands.length - i));
			}, 0);
	});
};
