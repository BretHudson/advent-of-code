importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	// console.log('what the fuck???');

	const pairs = input.split('\n').map((line) => line.split('-'));

	const nodes = [...new Set(pairs.flat())].reduce((acc, name) => {
		acc[name] = {
			name,
			isSmall: name === name.toLowerCase(),
			connectsTo: [],
		};
		return acc;
	}, {});

	pairs.forEach(([a, b]) => {
		const nodeA = nodes[a];
		const nodeB = nodes[b];
		if (b !== 'start') nodeA.connectsTo.push(nodeB);
		if (a !== 'start') nodeB.connectsTo.push(nodeA);
	});

	const search = (currentNode, visited, _doubled) => {
		let count = 0;
		visited = visited.concat(currentNode);
		for (let i = 0; i < currentNode.connectsTo.length; ++i) {
			const nextNode = currentNode.connectsTo[i];
			const { name } = nextNode;
			if (name === 'start') continue;
			if (name === 'end') {
				++count;
				continue;
			}

			let doubled = _doubled;
			if (nextNode.isSmall && visited.indexOf(nextNode) > -1) {
				if (doubled) continue;
				doubled = true;
			}
			count += search(nextNode, visited, doubled);
		}

		return count;
	};

	result[0] = search(nodes['start'], [], true);
	result[1] = search(nodes['start'], [], false);

	sendResult();
};
