importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const ENTRANCE = '@';
	const FLOOR = '.';
	const WALL = '#';

	const mapToIndex = (c, a) => c.toString().charCodeAt(0) - a.charCodeAt(0);
	const arr10 = [...Array(10).keys()];
	const arr26 = [...Array(26).keys()];
	const isKey = (c) => arr26.includes(mapToIndex(c, 'a'));
	const isDoor = (c) => arr26.includes(mapToIndex(c, 'A'));
	const isWall = (c) => c === WALL;
	const isEntrance = (c) =>
		c === ENTRANCE || arr10.includes(mapToIndex(c, '0'));
	const isEmpty = (c) => c === FLOOR;

	const getNeighborsOrth = (cur) => [
		[cur[0] - 1, cur[1]],
		[cur[0] + 1, cur[1]],
		[cur[0], cur[1] - 1],
		[cur[0], cur[1] + 1],
	];

	const createHash = (cur, keyState) => cur.join('') + keyState;

	const hasKey = (keyState, key) => {
		if (typeof key === 'string') {
			const shift = mapToIndex(key, 'a');
			if (shift < 0) return false;
			key = 1 << shift;
		}
		return (keyState & key) > 0;
	};

	const grid = input.split('\n').map((line) => line.split(''));
	const grid2 = input.split('\n').map((line) => line.split(''));
	const gridW = grid[0].length;
	const gridH = grid.length;

	let entrance;
	const keyMap = {};
	const doorMap = {};
	for (let y = 0; y < gridH; ++y) {
		for (let x = 0; x < gridW; ++x) {
			const cell = grid[y][x];
			if (isKey(cell)) keyMap[cell] = [x, y];
			if (isDoor(cell)) doorMap[cell] = [x, y];
			if (isEntrance(cell)) entrance = [x, y];
		}
	}

	const [eX, eY] = entrance;
	for (let y = -1; y <= 1; ++y) {
		for (let x = -1; x <= 1; ++x) {
			grid2[eY + y][eX + x] =
				(x === 0 && y === 0) || (y + x) % 2 ? WALL : ENTRANCE;
		}
	}

	const numKeys = Object.entries(keyMap).length;
	const allKeys = (1 << numKeys) - 1;

	const run = (grid) => {
		const entrances = [];
		for (let y = 0; y < gridH; ++y) {
			for (let x = 0; x < gridW; ++x) {
				const cell = grid[y][x];
				if (isEntrance(cell)) {
					grid[y][x] = entrances.length.toString();
					entrances.push([x, y]);
				}
			}
		}

		const itemMap = {
			...keyMap,
			...doorMap,
		};

		const numRobots = entrances.length;
		for (let i = 0; i < numRobots; ++i) {
			itemMap[i] = entrances[i];
		}

		const graph = {};

		const buildGraph = (from) => {
			const start = itemMap[from];
			const queue = [[start]];
			const visited = new Set([start.join(',')]);
			while (queue.length) {
				const [pos, steps = 0] = queue.shift();
				const neighbors = getNeighborsOrth(pos);
				const cur = grid[pos[1]][pos[0]];
				if (steps > 0 && !isEmpty(cur)) {
					graph[from][cur] = steps;
					graph[cur][from] = steps;
					continue;
				}

				const nextInQueue = neighbors
					.filter(([x, y]) => !isWall(grid[y][x]))
					.filter((n) => {
						return !visited.has(n.join(','));
					});
				nextInQueue.forEach((n) => {
					visited.add(n.join(','));
				});
				queue.push(...nextInQueue.map((pos) => [pos, steps + 1]));
			}
		};

		Object.keys(itemMap).forEach((key) => (graph[key] = {}));
		Object.keys(itemMap).forEach(buildGraph);

		const queue = [];
		const cache = new Map();

		const findNeighbors = (graph, start, keyState) => {
			const neighbors = [];
			const queue = [[start]];
			const visited = new Set([start]);
			while (queue.length) {
				const [cur, steps = 0] = queue.shift();
				const node = graph[cur];
				const immediateNeighbors = Object.keys(node);
				immediateNeighbors.forEach((n) => {
					if (visited.has(n)) return;
					visited.add(n);

					// NOTE: collectedKey is true when the space is a key OR a door!
					const collectedKey = hasKey(keyState, n.toLowerCase());
					if (isEntrance(n) || collectedKey) {
						queue.push([n, steps + node[n]]);
					} else if (isKey(n)) {
						neighbors.push([n, steps + node[n]]);
					}
				});
			}
			return neighbors;
		};

		queue.push([Object.keys(entrances).map((i) => i.toString())]);

		const search = function* () {
			while (queue.length) {
				const [robots, keyState = 0, curSteps = 0, from = []] =
					queue.shift();

				if (keyState === allKeys) yield curSteps;

				for (let i = 0; i < robots.length; ++i) {
					const neighbors = findNeighbors(graph, robots[i], keyState);
					neighbors.forEach(([neighbor, newSteps]) => {
						const newKeyState =
							keyState | (1 << mapToIndex(neighbor, 'a'));
						const next = [...robots];
						next[i] = neighbor;

						const hash = createHash(next, newKeyState);
						if (cache.get(hash) <= curSteps + newSteps) return;
						cache.set(hash, curSteps + newSteps);

						queue.push([
							next,
							newKeyState,
							curSteps + newSteps,
							from.concat([neighbor]),
						]);
					});
				}
			}
		};

		return Math.min(...search());
	};

	result[0] = run(grid);
	result[1] = run(grid2);
	sendResult();
};
