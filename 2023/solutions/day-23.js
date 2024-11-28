const parse = (input) => input.split('\n').map(([...row]) => row);

const withStartEnd = (grid) => [
	grid[0].indexOf('.'),
	grid.at(-1).indexOf('.') | ((grid.length - 1) << 16),
	grid,
];

const DIR = [
	[0, -1, '^'],
	[1, 0, '>'],
	[0, 1, 'v'],
	[-1, 0, '<'],
].map(([x, y, slope]) => [x | (y << 16), slope]);

const searchLongestPathGrid = ([start, end, grid]) => {
	const max = new Map();
	const dfs = (pos, path = new Set()) => {
		let nextPositions = [pos];
		while (nextPositions.length === 1) {
			const next = nextPositions[0];
			path.add(next);

			if (max.get(next) > path.size) return;
			max.set(next, path.size);

			nextPositions = DIR.filter(
				([, slope]) =>
					grid[next >> 16][next & 0xffff] === '.' ||
					grid[next >> 16][next & 0xffff] === slope,
			)
				.map((d) => d[0] + next)
				.filter(
					(n) =>
						(grid[n >> 16]?.[n & 0xffff] ?? '#') !== '#' &&
						!path.has(n),
				);
		}
		nextPositions.forEach((pos) => dfs(pos, new Set(path)));
	};
	dfs(start);

	return max.get(end) - 1;
};

const intersectionGraph = ([start, end, grid]) => {
	const edges = [];
	const queue = [[start, new Set()]];
	while (queue.length) {
		const [next, path] = queue.shift();
		path.add(next);
		if (next === end) {
			edges.push(path);
			continue;
		}
		const positions = DIR.map((d) => d[0] + next)
			.filter((p) => (grid[p >> 16]?.[p & 0xffff] ?? '#') !== '#')
			.filter((p) => !path.has(p));

		if (positions.length > 1) {
			edges.push(path);
			queue.push(
				...positions
					.filter((np) => !edges.some((edge) => edge.has(np)))
					.map((np) => [np, new Set([next])]),
			);
		} else {
			queue.push(...positions.map((np) => [np, path]));
		}
	}
	return [
		start,
		end,
		[
			...edges
				.map(([...edge]) => [edge[0], edge.at(-1), edge.length - 1])
				.reduce(
					(g, [a, b, len]) =>
						g
							.set(a, (g.get(a) ?? new Map()).set(b, len))
							.set(b, (g.get(b) ?? new Map()).set(a, len)),
					new Map(),
				),
		].reduce((map, [k, [...v]]) => map.set(k, v), new Map()),
	];
};

const searchLongestPathGraph = ([start, end, graph]) => {
	const recurse = (node, path = new Set()) => {
		if (node === end) return 0;
		path.add(node);
		const cost = graph
			.get(node)
			.filter(([next]) => !path.has(next))
			.map(([next, cost]) => cost + recurse(next, path))
			.reduce((max, v) => Math.max(max, v), 0);
		path.delete(node);
		return cost;
	};
	return recurse(start);
};

export const solution = (input) => {
	const answers = [null, null];

	const a = parse(input);
	console.log(a);
	const b = withStartEnd(a);
	console.log(b);
	const c = intersectionGraph(b);
	console.log(c);
	const d = searchLongestPathGraph(c);
	console.log(d);

	answers[1] = d;
	return answers;

	const grid2D = input.split('\n').map((v) => v.split(''));

	const width = grid2D[0].length;
	const height = grid2D.length;

	const grid = grid2D.flat().map((type) => ({
		type,
		distance: null,
		distances: [],
	}));

	const getPos = (index) => [index % width, Math.floor(index / width)];
	const getIndex = (x, y) => y * width + x;
	const checkPos = (x, y, slope) => {
		const { type } = grid[getIndex(x, y)];
		return type === '.' || type === slope;
	};

	const startPos = getPos(grid.findIndex(({ type }) => type === '.'));
	const startCell = grid[getIndex(...startPos)];
	const endPos = getPos(grid.findLastIndex(({ type }) => type === '.'));
	const endCell = grid[getIndex(...endPos)];

	const graph = new Map();

	const getGraphNode = (cell) => {
		const node = graph.get(cell);
		if (!node) {
			const newNode = { cell, to: new Map(), edge: new Map() };
			graph.set(cell, newNode);
			return newNode;
		}
		return node;
	};
	const addToGraph = (from, to, distance) => {
		const nodeA = getGraphNode(from);
		const nodeB = getGraphNode(to);

		nodeA.to.set(nodeB, distance);
		nodeA.edge.set(nodeB, distance);
		nodeB.edge.set(nodeA, distance);

		return [nodeA, nodeB];
	};

	// create the initial node
	const startNode = getGraphNode(startCell);
	const endNode = getGraphNode(endCell);
	console.log(startNode);

	const hike = () => {
		grid.forEach((cell) => cell.distances.splice(0, cell.distances.length));

		const queue = [];

		const addToQueue = (from, x, y, depth, pathIndex, slope) => {
			const { distances } = grid[getIndex(x, y)];
			if (typeof distances[pathIndex] === 'number') return;

			queue.push([from, x, y, depth, pathIndex, slope]);
		};

		addToQueue(startNode, ...startPos, 0, 0);

		while (queue.length) {
			const curPos = queue.shift();
			const [from, x, y, depth, pathIndex, dir] = curPos;

			const cell = grid[getIndex(x, y)];
			cell.distances[pathIndex] = depth;
			cell.distance = Math.max(cell.distance, depth);

			if (cell === endCell) {
				addToGraph(from.cell, cell, depth);
				continue;
			}

			const goL = dir !== '>' && x > 0 && checkPos(x - 1, y, '<');
			const goR = dir !== '<' && x < width - 1 && checkPos(x + 1, y, '>');
			const goU = dir !== 'v' && y > 0 && checkPos(x, y - 1, '^');
			const goD =
				dir !== '^' && y < height - 1 && checkPos(x, y + 1, 'v');

			const moves = [];
			if (goL) moves.push([x - 1, y, '<']);
			if (goR) moves.push([x + 1, y, '>']);
			if (goU) moves.push([x, y - 1, '^']);
			if (goD) moves.push([x, y + 1, 'v']);

			let _from = from;

			const offsets = [
				[x - 1, y],
				[x + 1, y],
				[x, y - 1],
				[x, y + 1],
			]
				.map((pos) => grid[getIndex(...pos)])
				.filter(Boolean)
				.filter((c) => ['<', '>', '^', 'v'].includes(c.type));
			const branched = offsets.length === 3;

			let _depth = depth + 1;
			if (branched) {
				console.warn('branch', x, y);
				addToGraph(from.cell, cell, depth);
				_from = getGraphNode(cell);
				_depth = 1;
			}

			moves.forEach(([x, y, slope], i) => {
				if (i === 0) {
					addToQueue(_from, x, y, _depth, pathIndex, slope);
				} else {
					let newPathIndex = startCell.distances.length;
					for (let yy = 0; yy < height; ++yy) {
						for (let xx = 0; xx < width; ++xx) {
							const cell = grid[getIndex(xx, yy)];
							const d = cell.distances[pathIndex];
							if (typeof d === 'number')
								cell.distances[newPathIndex] = d;
						}
					}
					addToQueue(_from, x, y, _depth, newPathIndex, slope);
				}
			});
		}
	};

	hike();

	const renderGrid = (grid, asString) => {
		const str = [];
		for (let i = 0; i < height; ++i) {
			const start = i * width;
			let row = grid
				.slice(start, start + width)
				.map(({ type, distances }) =>
					distances.length
						? Math.max(
								...distances.filter(
									(d) => typeof d === 'number',
								),
						  )
						: type,
				);
			if (asString) row = row.join('');
			str.push(row);
		}
		if (asString) console.log(str.join('\n'));
		else console.table(str);
	};
	// renderGrid(grid);

	// remove the slopes
	// grid.forEach((cell) => (cell.type = cell.type === '#' ? '#' : '.'));
	// answers[1] = hike();

	let i = 0;
	const hikeGraph = (from, visited, backtrack) => {
		// console.log(++i, from);
		let nextNodes = [...(backtrack ? from.edge : from.to).keys()];
		let before = nextNodes.length;
		// console.log('nextNodes', nextNodes, visited);
		nextNodes = nextNodes.filter((node) => {
			// console.log(node, visited);
			return visited.indexOf(node) === -1;
		});
		if (before !== nextNodes.length) {
			// console.error({ before, after: nextNodes.length });
		}
		// if (visited.length > 0) return 0;
		const depths = nextNodes.map((node) => {
			const next = hikeGraph(node, visited.concat(from), backtrack);
			// console.log({ node, distance, next });
			const distance =
				(backtrack ? from.edge.get(node) : from.to.get(node)) ?? 0;
			return +distance + next;
		});
		if (depths.length) return Math.max(...depths);
		return 0;
	};

	console.log(graph);

	answers[0] = hikeGraph(startNode, [], false);
	answers[1] = hikeGraph(startNode, [], true);

	// renderGrid(grid);

	return answers;
};

// https://www.reddit.com/r/adventofcode/comments/18ysozp/day_23_2023_any_tips_to_further_improve/
