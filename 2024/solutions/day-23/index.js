export const solution = (input) => {
	const answers = [null, null];

	const connections = input.split('\n').map((line) => line.split('-'));

	const computers = Object.fromEntries(
		[...new Set(connections.flat())].map((k) => [k, []]),
	);

	connections.forEach(([a, b]) => {
		computers[a].push(b);
		computers[b].push(a);
	});

	const valid = Object.entries(computers)
		.flatMap(([k, v]) => {
			let triplets = [];
			for (let i = 0; i < v.length; ++i) {
				for (let j = 0; j < v.length; ++j) {
					if (computers[v[i]].includes(v[j]))
						triplets.push([k, v[i], v[j]].sort());
				}
			}
			return triplets;
		})
		.filter((t) => t.some((v) => v.startsWith('t')));

	const unique = new Set(valid.map((v) => v.join(',')));

	const allTriplets = [...unique].map((t) => t.split(','));
	const allComputers = [...new Set(allTriplets.flat())];

	let sets = [...allTriplets];
	while (sets.length > 1) {
		const biggerSets = new Set();
		for (let i = 0; i < sets.length; ++i) {
			const combo = sets[i];
			const valid = allComputers
				.filter((computer) => !combo.includes(computer))
				.filter((computer) => {
					return combo.every((c) => computers[c].includes(computer));
				})
				.map((v) => [...combo, v].sort().join(','));

			if (valid.length) {
				biggerSets.add(...valid);
			}
		}

		sets = [...biggerSets].map((t) => t.split(','));
	}

	answers[0] = unique.size;
	answers[1] = sets[0].join(',');

	return answers;
};
