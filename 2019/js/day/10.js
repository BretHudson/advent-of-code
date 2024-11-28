importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const asteroids = input.split('\n').flatMap((line, y) => {
		return line
			.split('')
			.map((v, x) => [v, x, y])
			.filter(([v]) => v === '#')
			.map(([_, ...pos]) => ({ pos }));
	});

	asteroids.forEach((self) => {
		const [x, y] = self.pos;
		self.detected = asteroids.reduce((detected, other) => {
			if (self === other) return detected;

			const [oX, oY] = other.pos;
			const slope = Math.atan2(oY - y, oX - x) + Math.PI / 2;

			if (!detected.has(slope)) detected.set(slope, []);
			detected.get(slope).push(other);

			return detected;
		}, new Map());
	});

	asteroids.sort((a, b) => b.detected.size - a.detected.size);

	const [bestLocation] = asteroids;
	bestLocation.detected.forEach((asteroidsAtAngle) => {
		const self = bestLocation;
		asteroidsAtAngle.forEach((other) => {
			const distance =
				Math.abs(other.pos[0] - self.pos[0]) +
				Math.abs(other.pos[1] - self.pos[1]);
			other.distance = distance;
		});
		asteroidsAtAngle.sort((a, b) => a.distance - b.distance);
	});

	const TAU = Math.PI * 2;
	const modRad = (rad) => (rad - TAU) % TAU;
	const keys = [...bestLocation.detected.keys()].sort((a, b) => {
		if (a === 0) return -1;
		if (b === 0) return 1;
		return modRad(a) - modRad(b);
	});

	const astroidsDestroyed = [];
	for (let i = 0; astroidsDestroyed.length < 200; ++i) {
		const targets = bestLocation.detected.get(keys[i % keys.length]);
		if (targets.length === 0) continue;

		astroidsDestroyed.push(targets.shift());
	}
	const vaporized200 = astroidsDestroyed[199];

	result[0] = bestLocation.detected.size;
	result[1] = vaporized200.pos[0] * 100 + vaporized200.pos[1];

	sendResult();
};
