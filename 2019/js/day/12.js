importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const regex = /(?:(?<label>[xyz])=(?<value>-?\d+)(?:, )?)/g;
	const bodies = input.split('\n').map((line) => {
		let matches;
		const body = {
			pos: [],
			vel: [0, 0, 0],
			repeat: Array.from({ length: 3 }, () => Number.POSITIVE_INFINITY),
		};
		while ((matches = regex.exec(line))) {
			body.pos.push(+matches.groups.value);
		}
		body.initialPos = [...body.pos];
		return body;
	});

	const reduceSum = (a, v) => a + Math.abs(v);

	const firstRepeat = [null, null, null];

	const subVec = (b, a) => a.map((v, i) => b[i] - v);
	const addVec = (a, b) => a.map((v, i) => b[i] + v);

	const steps = 1000;
	let step = 1;

	const simulateStep = () => {
		for (let i = 0; i < bodies.length; ++i) {
			for (let j = i + 1; j < bodies.length; ++j) {
				const a = bodies[i];
				const b = bodies[j];
				const delta = subVec(b.pos, a.pos).map(Math.sign);
				a.vel = addVec(a.vel, delta);
				b.vel = subVec(b.vel, delta);
			}
		}

		const repeat = [true, true, true];
		for (let i = 0; i < bodies.length; ++i) {
			const body = bodies[i];
			const { pos, initialPos, vel } = body;
			body.pos = addVec(pos, vel);

			for (let c = 0; c < 3; ++c) {
				repeat[c] &= pos[c] === initialPos[c] && vel[c] === 0;
			}
		}

		for (let c = 0; c < 3; ++c) {
			if (repeat[c]) firstRepeat[c] ??= step;
		}
	};

	for (; step <= steps; ++step) {
		simulateStep();
	}

	const getKinetic = ({ pos, vel }) =>
		pos.reduce(reduceSum, 0) * vel.reduce(reduceSum, 0);

	result[0] = bodies.reduce((a, body) => a + getKinetic(body), 0);

	for (; firstRepeat.some((v) => !v); ++step) {
		simulateStep();
	}

	const lcm = (a, b) => {
		const large = Math.max(a, b);
		const small = Math.min(a, b);
		let i = large;
		for (; i % small !== 0; i += large);
		return i;
	};

	result[1] = lcm(lcm(firstRepeat[0], firstRepeat[1]), firstRepeat[2]);

	// 135

	sendResult();
};
