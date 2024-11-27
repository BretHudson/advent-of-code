importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [null, null];

	const DIR = {
		U: 0,
		R: 1,
		D: 2,
		L: 3,
	};

	const STATE = {
		CLEAN: 0,
		FLAGGED: 1,
		INFECTED: 2,
		WEAKENED: 3,
	};

	const hash = (...args) => [args].flat().join(',');

	const initialInfected = new Set();
	let gridW,
		gridH = 0;
	input.split('\n').forEach((line, y) => {
		gridW = line.length;
		++gridH;
		line.split('').forEach((cell, x) => {
			if (cell === '#') initialInfected.add(hash(x, y));
		});
	});

	const initPos = [gridW, gridH].map((v) => Math.floor(v / 2));

	const runVirus = (iter, extended = false) => {
		const nodes = new Map();
		initialInfected.forEach((key) => {
			nodes.set(key, STATE.INFECTED);
		});
		let infections = 0;
		let curPos = [...initPos];
		let curDir = DIR.U;

		const stateOffset = extended ? 3 : 2;

		for (let i = 1; i <= iter; ++i) {
			if (callback === null) infections += callback();
			else {
				const key = hash(curPos);
				const state = nodes.get(key);
				switch (state) {
					case STATE.FLAGGED:
						curDir = (curDir + 2) % 4;
						nodes.set(key, (state + stateOffset) % 4);
						break;
					case STATE.INFECTED:
						curDir = (curDir + 1) % 4;
						nodes.set(key, (state + stateOffset) % 4);
						break;
					case STATE.WEAKENED:
						nodes.set(key, (state + stateOffset) % 4);
						if (extended) ++infections;
						break;
					case STATE.CLEAN:
					default:
						curDir = (curDir + 3) % 4;
						nodes.set(key, ((state ?? 0) + stateOffset) % 4);
						if (!extended) ++infections;
						break;
				}
			}

			switch (curDir) {
				case DIR.U:
					--curPos[1];
					break;
				case DIR.R:
					++curPos[0];
					break;
				case DIR.D:
					++curPos[1];
					break;
				case DIR.L:
					--curPos[0];
					break;
			}
		}

		return infections;
	};

	result[0] = runVirus(10000);
	result[1] = runVirus(10000000, true);

	callback(result);
});
