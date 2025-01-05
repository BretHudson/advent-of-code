importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const grid = input.split('\n').map((line) => line.split(''));
	const gridW = grid[0].length;
	const gridH = grid.length;

	const isPassage = (x, y) => grid[y][x] === '.';

	const getNeighbors = (x, y) => {
		return [
			[x + 1, y], // right
			[x, y - 1], // up
			[x - 1, y], // left
			[x, y + 1], // down
		].map((pos) => {
			const [x, y] = pos;
			if (x < 0 || y < 0 || x > gridW - 1 || y > gridH - 1) return null;
			return pos;
		});
	};

	const getDonutMinMax = (grid) => {
		const size = grid[0].length - 4;
		const holeCoords = grid
			.map((c) => c.filter((v) => ['#', '.'].includes(v)).join(''))
			.map((c, i) => [c, i])
			.filter(([line]) => line.length && line.length < size)
			.map(([_, i]) => i);
		return [Math.min(...holeCoords), Math.max(...holeCoords)];
	};

	const [donutXMin, donutXMax] = getDonutMinMax(grid.transpose());
	const [donutYMin, donutYMax] = getDonutMinMax(grid);

	const portals = {};
	const findPortal = ([cX, cY], [dX, dY]) => {
		const cell = grid[cY]?.[cX];
		if (cell && cell !== ' ' && cell !== '.' && cell !== '#') {
			const name = [grid[cY - dY][cX - dX], cell];
			if (dX + dY < 0) name.reverse();
			(portals[name.join('')] ??= []).push([cX + dX, cY + dY]);
		}
	};

	/// find the outer portals first, so they are always at index 0 (aka outerIndex)
	// outer portals
	for (let coord = 0; coord < Math.max(gridW, gridH); ++coord) {
		findPortal([coord, 1], [0, 1]);
		findPortal([coord, gridH - 2], [0, -1]);
		findPortal([1, coord], [1, 0]);
		findPortal([gridW - 2, coord], [-1, 0]);
	}

	// inner portals
	for (let coord = 0; coord < Math.max(gridW, gridH); ++coord) {
		if (coord >= donutXMin && coord <= donutXMax) {
			findPortal([coord, donutYMin], [0, -1]);
			findPortal([coord, donutYMax], [0, 1]);
		}
		if (coord >= donutYMin && coord <= donutYMax) {
			findPortal([donutXMin, coord], [-1, 0]);
			findPortal([donutXMax, coord], [1, 0]);
		}
	}

	const indexOuter = 0;
	const indexInner = 1;

	const posToPortalMap = Object.fromEntries(
		Object.entries(portals).flatMap(([name, to]) => {
			return to.map((pos, i) => [
				pos.join(','),
				[name, i].slice(0, to.length),
			]);
		}),
	);

	const getName = (name, index) => {
		return portals[name].length > 1 ? [name, index].join('') : name;
	};

	const searchFromNode = (graph, from, index = indexOuter) => {
		const queue = [[portals[from][index], 0]];
		const connectsTo = [];
		const visited = new Set();
		visited.add(queue[0][0].join(','));
		while (queue.length) {
			const [cur, depth] = queue.shift();
			const neighbors = getNeighbors(...cur).filter(
				(pos) => !visited.has(pos.join(',')),
			);
			neighbors
				.filter((pos) => isPassage(...pos))
				.forEach((pos) => {
					if (!visited.has(pos.join(','))) {
						visited.add(pos.join(','));
						queue.push([pos, depth + 1]);
					}
				});

			connectsTo.push(
				...neighbors
					.map((pos) => posToPortalMap[pos.join(',')])
					.filter(Boolean)
					.map((to) => [to, depth + 1]),
			);
		}

		const fromName = getName(from, 1 - index);
		graph[fromName].entries ??= [];
		for (let i = 0; i < connectsTo.length; ++i) {
			const [to, depth] = connectsTo[i];
			const toName = getName(...to);
			graph[fromName].entries.push([toName, depth]);
		}
	};

	const graph = Object.fromEntries(
		Object.entries(portals).flatMap(([name, to]) => {
			return to.map((_, i) => [getName(name, i), {}]);
		}),
	);
	Object.values(posToPortalMap).forEach((p) => {
		searchFromNode(graph, ...p);
	});

	const start = getName('AA');
	const exit = getName('ZZ');

	const searchForExit = (recursive = false) => {
		const queue = [[start]];
		let minSteps = Infinity;
		while (queue.length) {
			const [cur, steps = -1, level = 0] = queue.shift();
			if (steps >= minSteps) continue;
			if (cur === exit) {
				minSteps = steps;
				continue;
			}

			const node = graph[cur].entries;
			for (let i = 0, n = node.length; i < n; ++i) {
				const [k, v] = node[i];
				let nextLevel = level;
				if (recursive) {
					if (level > 0 && k.length === 2) continue;

					const identifier = +k[2];
					if (!Number.isNaN(identifier)) {
						if (identifier === indexInner) ++nextLevel;
						if (identifier === indexOuter) {
							if (level === 0) continue;
							--nextLevel;
						}
					}
				}
				queue.push([k, steps + v + 1, nextLevel]);
			}
		}
		return minSteps;
	};

	result[0] = searchForExit();
	result[1] = searchForExit(true);

	sendResult();
};
