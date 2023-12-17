// note: indices are off by one
const spelledDigits = [
	'one',
	'two',
	'three',
	'four',
	'five',
	'six',
	'seven',
	'eight',
	'nine',
];

const longestWordLength = spelledDigits.reduce(
	(acc, val) => Math.max(acc, val.length),
	0,
);

// original solution
// input
// 		.split('\n')
// 		.map((line) => line.match(/\d/g))
// 		.map((digits) => +(digits[0] + digits.at(-1)))
// 		.reduce((acc, val) => acc + val, 0);

const computeCalibrationSum = (input, useWords) => {
	let cursor = 0;
	let line = 0;
	let lineDigits = [[]];
	let consumed = 1;
	for (; cursor < input.length; cursor += consumed) {
		const nextCharacter = input.substring(cursor, cursor + 1);

		switch (nextCharacter) {
			case '\n': {
				++line;
				lineDigits.push([]);
				continue;
			}

			// super cursed :) enjoy
			case nextCharacter.match(/\d/)?.[0]: {
				lineDigits[line].push(+nextCharacter);
				continue;
			}

			default: {
				if (!useWords) continue;

				const possibleDigit = input.substring(
					cursor,
					cursor + longestWordLength,
				);

				const digit = spelledDigits.find((d) =>
					possibleDigit.startsWith(d),
				);
				if (digit) {
					const number =
						spelledDigits.findIndex((d) => d === digit) + 1;
					lineDigits[line].push(number);
				}
			}
		}
	}

	return lineDigits
		.map((digits) => digits[0] * 10 + digits.at(-1))
		.reduce((acc, val) => acc + val, 0);
};

export const solution = (input) => {
	return [false, true].map((useWords) =>
		computeCalibrationSum(input, useWords),
	);
};
