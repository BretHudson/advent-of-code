importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	const result = [null, null];

	const regex = /p=<(?<pos>.*?)>, v=<(?<vel>.*?)>, a=<(?<acc>.*?)>/g;

	const particles = [];

	const getDistance = (vec) => Math.abs(vec[0]) + Math.abs(vec[1]) + Math.abs(vec[2]);

	for (let matches, id = 0; (matches = regex.exec(input)); ++id) {
		const data = Object.entries(matches.groups).map(([k, v]) => {
			return [k, v.split(',').map(Number)];
		});
		const particle = Object.fromEntries(data);
		particle.id = id;
		particle.manhatten = getDistance(particle.pos);
		particle.destroyed = null;

		particles.push(particle);
	}

	const quadratic = (a, b, c) => {
		if (a === 0) return c ? [-c / b] : [];
		const root = Math.sqrt(b * b - 4 * a * c);
		return [-b + root, -b - root].map((v) => v / (2 * a));
	};

	const posAtT = (particle, t) => particle.pos.map((p, i) => {
		const v = particle.vel[i];
		const a = particle.acc[i];
		return p + t * v + (a * t * (t + 1)) / 2;
	});

	const collide = (pA, pB) => {
		const possibleTs = quadratic(
			(pA.acc[0] - pB.acc[0]) / 2,
			pA.vel[0] + pA.acc[0] / 2 - (pB.vel[0] + pB.acc[0] / 2),
			pA.pos[0] - pB.pos[0],
		).filter((v) => v > 0 && v === Math.round(v));

		return possibleTs.some((t) => {
			const posA = posAtT(pA, t);
			const posB = posAtT(pB, t);

			return (
				posA[0] === posB[0] &&
				posA[1] === posB[1] &&
				posA[2] === posB[2]
			);
		});
	};

	for (let i = 0, n = particles.length; i < n; ++i) {
		for (let j = i + 1; j < n; ++j) {
			if (collide(particles[i], particles[j])) {
				particles[i].destroyed = true;
				particles[j].destroyed = true;
			}
		}
	}

	particles.sort((a, b) => a.manhatten - b.manhatten);
	particles.sort((a, b) => getDistance(a.acc) - getDistance(b.acc));
	result[0] = particles[0].id;
	result[1] = particles.filter((p) => !p.destroyed).length;

	/// simulation version
	/// NOTE: this does have the side effect of modifying the pos/vel of particles!
	// let remaining = [...particles].reverse();
	// for (let i = 1; i <= 100; ++i) {
	// 	const positions = {};
	// 	remaining.forEach((particle) => {
	// 		for (let i = 0; i < 3; ++i) {
	// 			particle.vel[i] += particle.acc[i];
	// 			particle.pos[i] += particle.vel[i];
	// 		}
	// 		const key = particle.pos.join(',');
	// 		particle.hash = key;
	// 		positions[key] ??= 0;
	// 		++positions[key];
	// 	});
	// 	remaining = remaining.filter((p) => positions[p.hash] === 1);
	// }
	// result[1] = remaining.length;

	callback(result);
});
