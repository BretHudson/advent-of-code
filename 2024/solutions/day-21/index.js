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

	const numericKeys = [
		[7, 8, 9],
		[4, 5, 6],
		[1, 2, 3],
		['', 0, 'A'],
	];
	const directionalKeys = [
		['', '^', 'A'],
		['<', 'v', '>'],
	];

	const move = {};

	const indices = ['<', '^', 'v', '>'];
	const offsets = {
		'<': [-1, 0],
		'>': [1, 0],
		'^': [0, -1],
		v: [0, 1],
	};

	const computeMoves = (keyGrid) => {
		const keyMap = registerKeys(keyGrid);
		const keys = [...keyMap.keys()];
		keys.forEach((startKey) => {
			const start = keyMap.get(startKey);
			move[startKey] ??= {};

			keys.forEach((endKey) => {
				if (startKey === endKey) return;

				const end = keyMap.get(endKey);
				const delta = [end[0] - start[0], end[1] - start[1]];
				const newMove = [];
				for (; delta[0] !== 0; delta[0] -= Math.sign(delta[0])) {
					newMove.push(delta[0] > 0 ? '>' : '<');
				}
				for (; delta[1] !== 0; delta[1] -= Math.sign(delta[1])) {
					newMove.push(delta[1] > 0 ? 'v' : '^');
				}

				newMove.sort((a, b) => indices.indexOf(a) - indices.indexOf(b));

				const pos = [...start];
				for (let i = 0; i < newMove.length; ++i) {
					pos[0] += offsets[newMove[i]][0];
					pos[1] += offsets[newMove[i]][1];
					if (keyGrid[pos[1]][pos[0]] === '') {
						newMove.reverse();
						break;
					}
				}

				move[startKey][endKey] = newMove.join('');
			});
		});
	};

	computeMoves(directionalKeys);
	computeMoves(numericKeys);

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
					c += move[cur][next];
					cur = next;
				}
				chain.push(c + 'A');
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
