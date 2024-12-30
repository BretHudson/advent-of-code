importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const displays = input.split('\n').map((line) => {
		return line.split(' | ').map((v) => v.split(' '));
	});

	const mappings = [
		'abcefg',
		'cf',
		'acdeg',
		'acdfg',
		'bcdf',
		'abdfg',
		'abdefg',
		'acf',
		'abcdefg',
		'abcdfg',
	].map((wires) => wires.split('').map((v) => v));

	const digits = mappings.length;

	const lengthToDigitsMap = mappings.reduce((acc, v, i) => {
		(acc[v.length] ??= []).push(i);
		return acc;
	}, {});

	const easyLengths = Object.entries(lengthToDigitsMap)
		.filter(([, v]) => v.length === 1)
		.map(([k]) => +k);

	result[0] = displays.flatMap(([, outputs]) =>
		outputs.filter((o) => easyLengths.includes(o.length)),
	).length;

	const similarities = Array.from({ length: digits }, () => []);
	for (let a = 0; a < digits; ++a) {
		for (let b = a + 1; b < digits; ++b) {
			similarities[a][b] = similarities[b][a] = mappings[a].filter(
				(value) => mappings[b].includes(value),
			).length;
		}
	}

	const skip = easyLengths.map((v) => lengthToDigitsMap[v][0]);
	const scores = displays.map((display) => {
		const [inputs, outputs] = display;
		const matches = easyLengths.map((length) => {
			return inputs
				.filter((input) => input.length === length)[0]
				.split('');
		});

		const findMatch = (i) => {
			const expect = skip.map((v) => similarities[i][v]).join('');
			const matchedInput = inputs.find((input) => {
				const similar = matches
					.map((wires) => {
						return wires.filter((w) => input.includes(w)).length;
					})
					.join('');
				return expect === similar;
			});
			return matchedInput.split('');
		};

		const inputToDigitMap = Object.fromEntries(
			Array.from({ length: 10 }, (_, i) => i).map((i) => {
				const result = matches[skip.indexOf(i)] ?? findMatch(i);
				return [result.sort().join(''), i];
			}),
		);

		return outputs
			.map((output) => output.split('').sort().join(''))
			.reduce((acc, output) => acc * 10 + inputToDigitMap[output], 0);
	});

	result[1] = scores.reduce((a, v) => a + v, 0);

	sendResult();
};
