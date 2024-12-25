export const solution = (input) => {
	const answers = [null, null];

	const lines = input.split('\n').map((line) => {
		return line.split('').map((v) => (Number.isNaN(+v) ? v : +v));
	});

	const registerKeys = (keys) => {
		const map = new Map();
		for (let y = 0; y < keys.length; ++y) {
			for (let x = 0; x < keys[y].length; ++x) {
				const key = keys[y][x];
				if (key === '') continue;
				map.set(key, [x, y]);
			}
		}
		return map;
	};

	const numericKeyMap = registerKeys([
		[7, 8, 9],
		[4, 5, 6],
		[1, 2, 3],
		['', 0, 'A'],
	]);
	const directionalKeyMap = registerKeys([
		['', '^', 'A'],
		['<', 'v', '>'],
	]);

	const move = {
		A: {
			0: '<',
			1: '^<<',
			3: '^',
			4: '^^<<', // shortest?
			9: '^^^',
			'<': 'v<<', // not shortest???
			'^': '<',
			'>': 'v',
			v: '<v',
		},
		// numpad
		0: { A: '>', 2: '^' },
		1: { 7: '^^' },
		2: { 9: '^^>' },
		3: { 7: '<<^^' }, // shortest?
		4: { 5: '>' },
		5: { 6: '>' },
		6: { A: 'vv' },
		7: { 9: '>>' },
		8: { 0: 'vvv' },
		9: { A: 'vvv', 8: '<' },
		// directional
		'<': {
			A: '>>^',
			'^': '>^',
			v: '>',
		},
		'^': { A: '>', '<': '<v', '>': 'v>' },
		'>': { A: '^', '^': '<^', v: '<' },
		v: { A: '^>', '<': '<', '>': '>' },
	};

	move['A'][8] = '<^^^'; // ??
	move[8][2] = 'vv';
	move[2][6] = '^>'; // ??

	move[3][4] = '<<^'; // ??
	move[4][1] = 'v';
	move[1]['A'] = '>>v'; // !

	move['A'][5] = '<^^'; // ??
	move[5][8] = '^';
	move[2]['A'] = 'v>'; // ??

	move[8][3] = 'vv>'; // ??
	move[3]['A'] = 'v';

	move['A'][6] = '^^';
	move[6][7] = move[3][4]; // lol
	move[7][0] = '>vvv'; // ??

	const cache = new Map();

	const handleChunk = (chunk, n) => {
		if (n === 0) return 0;

		const key = `${chunk}-${n}`;
		if (!cache.has(key)) {
			let cur = 'A';
			let chain = [];
			for (let i = 0; i < chunk.length; ++i) {
				let c = '';
				let next = chunk[i];
				if (cur !== next) {
					const blah = move[cur]?.[next];
					if (blah === undefined) {
						throw new Error(`'${cur}' => '${next}'`);
					}
					c += move[cur][next];
					cur = next;
				}
				c += 'A';
				chain.push(c);
			}

			let score = chain.join('').length;
			if (n > 1) {
				const scores = chain.map((chunk) => handleChunk(chunk, n - 1));
				score = scores.reduce((a, v) => a + v, 0);
			}
			cache.set(key, score);
		}

		return cache.get(key);
	};

	const getSum = (n) => {
		return lines
			.map((line) => {
				const length = handleChunk(line.join(''), n);
				const numeric = +line.slice(0, 3).join('');
				return length * numeric;
			})
			.reduce((a, v) => a + v, 0);
	};

	answers[0] = getSum(3);
	answers[1] = getSum(26);

	return answers;
};
