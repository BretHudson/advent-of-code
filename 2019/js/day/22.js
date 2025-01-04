importScripts('./../util.js');

const gcdCache = new Map();
function gcd(a, b) {
	const hash = [a, b].join(',');
	if (!gcdCache.has(hash)) {
		gcdCache.set(hash, b !== 0n ? gcd(b, a % b) : a);
	}
	return gcdCache.get(hash);
}

const modCache = new Map();
function modInverse(a, m) {
	const hash = [a, m].join(',');
	if (modCache.has(hash)) {
		return modCache.get(hash);
	}

	let result = null;
	if (gcd(a, m) === 1n) {
		let [x, y] = extendedEuclidean(a, m);
		result = ((x % m) + m) % m;
	}
	modCache.set(hash, result);
	return result;
}

const euclidCache = new Map();
function extendedEuclidean(a, b) {
	const hash = [a, b].join(',');
	if (!euclidCache.has(hash)) {
		let result = [1n, 0n];
		if (b !== 0n) {
			let [x1, y1] = extendedEuclidean(b, a % b);
			let y = x1 - (a / b) * y1;

			result = [y1, y];
		}
		euclidCache.set(hash, result);
	}
	return euclidCache.get(hash);
}

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const smallDeckLength = 10007;
	const giantDeckLength = 119315717514047n;

	const mapInput = (input, methods) => {
		return input
			.split('\n')
			.map((line) => {
				const [count] = line.split(' ').reverse();
				if (line === 'deal into new stack') return methods.dealNewStack;
				if (line.startsWith('cut')) return methods.cut(+count);
				if (line.startsWith('deal with'))
					return methods.dealWith(+count);
			})
			.filter(Boolean);
	};

	const arrMethods = {
		dealNewStack: (deck) => {
			const newStack = [];
			while (deck.length) newStack.unshift(deck.shift());
			return newStack;
		},
		cut: (n) => (deck) => {
			const cards = n > 0 ? deck.splice(0, n) : deck.splice(n);
			return n > 0 ? [...deck, ...cards] : [...cards, ...deck];
		},
		dealWith: (n) => (deck) => {
			const newDeck = Array.from(deck, () => null);
			for (let i = 0; deck.length; i += n) {
				const cur = deck.shift();
				newDeck[i % newDeck.length] = cur;
			}
			return newDeck;
		},
	};

	const dealWith = (n) => (deck, i) =>
		(i * modInverse(BigInt(n), deck.length)) % deck.length;
	const mathMethods = {
		dealNewStack: (deck, i) =>
			(dealWith(deck.length - 1n)(deck, i) - 1n + deck.length) %
			deck.length,
		cut: (n) => (deck, i) =>
			(((deck.length + i + BigInt(n)) % deck.length) + deck.length) %
			deck.length,
		dealWith,
	};

	const STR = {
		DEAL: 'deal into new stack',
		DEAL_WITH: 'deal with increment',
		CUT: 'cut',
	};

	const transformLines = (lineA, lineB) => {
		if (lineA[0] === STR.CUT && lineB[0] === STR.DEAL_WITH) {
			return [
				[STR.DEAL_WITH, lineB[1]],
				[STR.CUT, lineA[1] * lineB[1]],
			];
		}

		if (lineA[0] === lineB[0]) {
			let val = lineA[1];
			if (lineA[0] === STR.DEAL_WITH) val *= lineB[1];
			else val += lineB[1];

			return [[lineA[0], val % giantDeckLength]];
		}

		return [lineA, lineB];
	};

	const lines = input
		.split('\n')
		.flatMap((line) => {
			const count = Number(line.split(' ').reverse()[0]);
			const result = [line.replace(count, '').trim()];
			if (result[0].startsWith('Result')) return null;
			if (result[0] === STR.DEAL) {
				return [
					[STR.DEAL_WITH, giantDeckLength - 1n],
					[STR.CUT, 1n],
				];
			}
			if (!Number.isNaN(count)) result.push(BigInt(count));
			return [result];
		})
		.filter(Boolean);

	const compress = (lines) => {
		while (lines.length > 2) {
			for (let i = 0; i < lines.length - 1; ++i) {
				const newLines = transformLines(...lines.splice(i, 2));
				lines.splice(i, 0, ...newLines);
			}
		}
	};

	compress(lines);
	const firstTwoLines = lines.splice(0, 2);

	let pow;
	for (let left = 101741582076661; left > 0; left -= 2 ** pow) {
		pow = Math.floor(Math.log2(left));
		const newLines = firstTwoLines.map((v) => [...v]);
		for (let i = 0; i < pow; ++i) {
			newLines.push([...newLines[0]]);
			newLines.push([...newLines[1]]);
			compress(newLines);
		}
		lines.push(...newLines);
	}
	compress(lines);

	const transformStr = lines.map((line) => line.join(' ')).join('\n');

	const smallDeck = Array.from({ length: smallDeckLength }, (_, i) => i);
	result[0] = mapInput(input, arrMethods)
		.reduce((deck, func) => func(deck), smallDeck)
		.indexOf(2019);

	const giantDeck = { length: giantDeckLength };
	result[1] = mapInput(transformStr, mathMethods)
		.reverse()
		.reduce((value, func) => func(giantDeck, value), 2020n);

	sendResult();
};
