export const solution = (input) => {
	const answers = [null, null];

	const lines = input.split('\n').map(Number);

	const step = (secret) => {
		secret ^= (secret * 64) >>> 0;
		secret %= 16777216;

		secret ^= Math.floor(secret / 32) >>> 0;
		secret %= 16777216;

		secret ^= (secret * 2048) >>> 0;
		secret %= 16777216;
		if (secret < 0) secret += 16777216;

		return secret;
	};

	const deltas = new Map();

	const final = lines.map((line) => {
		let last;
		let secret = line;
		const seen = new Set();
		const changes = [];
		for (let i = 0; i < 2000; ++i) {
			last = secret % 10;
			secret = step(secret);
			const delta = (secret % 10) - last;
			changes.push(delta);
			if (changes.length >= 4) {
				const key = changes.slice(-4).join(',');
				if (!seen.has(key)) {
					seen.add(key);
					deltas.set(key, (deltas.get(key) ?? 0) + (secret % 10));
				}
			}
		}
		return secret;
	});

	answers[0] = final.reduce((a, v) => a + v, 0);
	answers[1] = Math.max(...deltas.values());

	return answers;
};
