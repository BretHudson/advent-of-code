const formatter = new Intl.ListFormat('en', {
	style: 'long',
	type: 'conjunction',
});

export const solution = (input) => {
	const answers = [null, null];

	const regex =
		/Valve (?<name>\w+) has flow rate=(?<flowRate>\d+); tunnels? leads? to valves? (?<leadsTo>\w+(?:,\s\w+)*)/g;

	const valvesMap = {};
	const valves = [];
	const getValveIndex = (name) => valves.indexOf(valvesMap[name]);

	let matches;
	while ((matches = regex.exec(input))) {
		const { name, flowRate, leadsTo } = matches.groups;
		const valve = {
			name,
			flowRate: +flowRate,
			leadsTo: leadsTo.split(', '),
		};
		valvesMap[name] = valve;
		valves.push(valve);
	}

	const startValve = valves[getValveIndex('AA')];

	// Floyd-Warshall Algorithm
	const m = Array.from(valves, () =>
		Array.from(valves, () => Number.POSITIVE_INFINITY),
	);
	const n = m.length;

	const dp = Array.from(m, () => Array.from(m));
	const next = Array.from(m, () => Array.from(m));

	valves.forEach((valve, i) => {
		const { leadsTo } = valve;
		m[i][i] = 0;
		leadsTo.forEach((otherId) => {
			const other = valves[getValveIndex(otherId)];
			m[i][getValveIndex(other.name)] = 1;
		});
	});

	for (let i = 0; i < n; ++i) {
		for (let j = 0; j < n; ++j) {
			dp[i][j] = m[i][j];
			if (m[i][j] !== Number.POSITIVE_INFINITY) {
				next[i][j] = j;
			}
		}
	}

	for (let k = 0; k < n; ++k) {
		for (let i = 0; i < n; ++i) {
			for (let j = 0; j < n; ++j) {
				if (dp[j][i] > dp[k][i] + dp[j][k]) {
					dp[j][i] = dp[k][i] + dp[j][k];
					next[j][i] = next[k][i];
				}
			}
		}
	}

	// ignore any valves without a flow rate (except AA since we start there)
	const nonZeroValves = valves
		.filter((valve) => valve.flowRate > 0)
		.map(({ name }) => name);

	valves.forEach((valve, i) => {
		valve.distances = nonZeroValves
			.map((v) => [v, dp[i][getValveIndex(v)]])
			.filter(([_, dist]) => dist);
	});

	const graph = [startValve.name, ...nonZeroValves].reduce((acc, valve) => {
		acc[valve] = valves[getValveIndex(valve)];
		return acc;
	}, {});

	const search = (
		graph,
		curValve,
		timeLeft,
		opened,
		available,
		releasePerInterval = 0,
		released = 0,
	) => {
		return Math.max(
			released + releasePerInterval * timeLeft,
			...graph[curValve].distances
				.filter(([other, dist]) => {
					return (
						timeLeft - dist > 1 &&
						opened.indexOf(other) === -1 &&
						available.indexOf(other) > -1
					);
				})
				.map(([other, dist]) => {
					return (
						(dist + 1) * releasePerInterval +
						released +
						search(
							graph,
							other,
							timeLeft - dist - 1,
							[...opened, other],
							available,
							graph[other].flowRate + releasePerInterval,
							released,
						)
					);
				}),
		);
	};

	const getCombos = (l, k, used = [], acc = []) => {
		if (used.length === k) {
			const combo = Array.from(used).map((i) => l[i]);
			const other = nonZeroValves.filter((v) => combo.indexOf(v) === -1);
			acc.push([combo, other]);
			return acc;
		}

		const start = used.length > 0 ? used[used.length - 1] : 0;
		const length = l.length - start;

		Array.from({ length }, (_, i) => i + start)
			.filter((i) => !used.includes(i))
			.forEach((i) => getCombos(l, k, [...used, i], acc));
		return acc;
	};

	const combos = getCombos(
		nonZeroValves,
		Math.floor(nonZeroValves.length / 2),
	);

	const search30 = search.bind(search, graph, startValve.name, 30);
	answers[0] = search30([], nonZeroValves);

	const search26 = search.bind(search, graph, startValve.name, 26);
	for (let c = 0, n = combos.length; c < n; ++c) {
		const [agent1, agent2] = combos[c];
		answers[1] = Math.max(
			answers[1],
			search26([], agent1) + search26([], agent2),
		);
	}

	return answers;
};
