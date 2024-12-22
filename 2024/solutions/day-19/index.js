export const solution = (input) => {
	const answers = [0, 0];

	const [patterns, designs] = input.split('\n\n').map((v, i) => {
		return v.split([', ', '\n'][i]);
	});

	const trie = {};
	for (let p = 0; p < patterns.length; ++p) {
		const letters = patterns[p].split('');
		let last = trie;
		for (let i = 0; i < letters.length; ++i) {
			const letter = letters[i];
			last[letter] ??= {};
			last = last[letter];
		}
		last.end = patterns[p];
	}

	const searchTrie = (letters) => {
		let last = trie;
		const found = [];
		for (let i = 0; i < letters.length && last; ++i) {
			last = last[letters[i]];
			if (last?.end) found.push(last.end);
		}
		return found.reverse();
	};

	const cache = new Map();
	cache.set('', 1);
	const construct = (design) => {
		if (cache.has(design)) return cache.get(design);

		let valid = 0;
		const sub = searchTrie(design);
		for (let i = 0; i < sub.length; ++i) {
			const str = sub[i];
			valid += construct(design.slice(str.length));
		}
		cache.set(design, valid);
		return valid;
	};

	for (let i = 0; i < designs.length; ++i) {
		const valid = construct(designs[i]);

		answers[0] += Math.sign(valid);
		answers[1] += valid;
	}

	return answers;
};
