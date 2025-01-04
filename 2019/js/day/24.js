importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const initialBugs = input.split('\n').flatMap((line, y) => {
		return line
			.split('')
			.map((c, x) => {
				if (c === '#') return [x, y];
				return 0;
			})
			.filter(Boolean);
	});

	const createGrid = (obj = {}) => ({
		bugs: new Set(),
		child: null,
		parent: null,
		bugsToLive: [],
		...obj,
	});

	const gridW = 5;
	const gridH = 5;

	const parseHash = (hash) => [(hash >> 8) & 0xff, hash & 0xff];
	const hashes = Array.from({ length: 5 }, (_, y) => {
		return Array.from({ length: 5 }, (_, x) => {
			return (x << 8) + y;
		});
	});

	const createHash = ([x, y]) => hashes[y][x];

	const grid = createGrid({
		index: 0,
		bugs: new Set(initialBugs.map(createHash)),
	});

	const withinBounds = (x, y) => !(x < 0 || y < 0 || x >= 5 || y >= 5);

	const borderLPos = [];
	const borderUPos = [];
	const borderRPos = [];
	const borderDPos = [];
	const borderPos = [];
	for (let y = 0; y < gridH; ++y) {
		for (let x = 0; x < gridW; ++x) {
			const hash = hashes[y][x];
			if (x === 0) borderLPos.push(hash);
			if (y === 0) borderUPos.push(hash);
			if (x === gridW - 1) borderRPos.push(hash);
			if (y === gridH - 1) borderDPos.push(hash);
			if (x > 0 && y > 0 && x < gridW - 1 && y < gridH - 1) continue;
			borderPos.push([x, y]);
		}
	}

	const adjCache = Array.from({ length: 5 }, (_, y) => {
		return Array.from({ length: 5 }, (_, x) => {
			const neighbors = [
				[x + 1, y, 0],
				[x, y + 1, 0],
				[x - 1, y, 0],
				[x, y - 1, 0],
			];

			const parentNeighbors = [];
			if (x === 0) parentNeighbors.push([1, 2]);
			if (x === gridW - 1) parentNeighbors.push([3, 2]);
			if (y === 0) parentNeighbors.push([2, 1]);
			if (y === gridH - 1) parentNeighbors.push([2, 3]);
			neighbors.push(...parentNeighbors.map((pos) => [...pos, 1]));

			const childNeighbors = [];
			if (x === 1 && y === 2) childNeighbors.push(...borderLPos);
			else if (x === 3 && y === 2) childNeighbors.push(...borderRPos);
			else if (x === 2 && y === 1) childNeighbors.push(...borderUPos);
			else if (x === 2 && y === 3) childNeighbors.push(...borderDPos);
			neighbors.push(
				...childNeighbors.map(parseHash).map((pos) => [...pos, -1]),
			);

			return neighbors.filter((p) => withinBounds(...p));
		});
	});

	const map = new Map();
	const increment = (hash, n) => {
		if (n === 0) return;
		if (!map.has(hash)) map.set(hash, 0);
		map.set(hash, map.get(hash) + n);
	};

	const step = (grid, recursive = false) => {
		map.clear();

		const { bugs } = grid;

		for (let y = 0; y < gridH; ++y) {
			for (let x = 0; x < gridW; ++x) {
				const adj = adjCache[y][x];
				const hash = hashes[y][x];

				if (grid.parent) {
					const parentNeighbors = adj
						.filter(([_, __, level]) => level === 1)
						.map(createHash)
						.filter((o) => grid.parent.bugs.has(o)).length;
					increment(hash, parentNeighbors);
				}

				if (grid.child) {
					const childNeighbors = adj
						.filter(([_, __, level]) => level === -1)
						.map(createHash)
						.filter((o) => grid.child.bugs.has(o)).length;
					increment(hash, childNeighbors);
				}

				if (!bugs.has(hash)) continue;

				const neighbors = adj
					.filter(([_, __, level]) => level === 0)
					.map(createHash);

				increment(hash, neighbors.filter((p) => bugs.has(p)).length);

				adj.filter(([_, __, level]) => level === 0)
					.map(createHash)
					.forEach((neighbor) => {
						if (recursive && neighbor === hashes[2][2]) return;
						if (bugs.has(neighbor)) return;
						increment(neighbor, 1);
					});
			}
		}

		grid.bugsToLive = [];
		for (let [key, neighbors] of map.entries()) {
			if (neighbors === 1 || (!bugs.has(key) && neighbors === 2)) {
				grid.bugsToLive.push(key);
			}
		}

		if (!recursive) return;

		if (grid.index >= 0) {
			if (bugs.size) {
				grid.child ??= createGrid({
					index: grid.index + 1,
					parent: grid,
				});
			}
			if (grid.child) step(grid.child, recursive);
		}

		if (grid.index <= 0) {
			if (bugs.size) {
				grid.parent ??= createGrid({
					index: grid.index - 1,
					child: grid,
				});
			}
			if (grid.parent) step(grid.parent, recursive);
		}
	};

	const updateGrid = (grid) => {
		grid.bugs = new Set(grid.bugsToLive);
		if (grid.index >= 0 && grid.child) updateGrid(grid.child);
		if (grid.index <= 0 && grid.parent) updateGrid(grid.parent);
	};

	const getScore = () => {
		let i = 1;
		let score = 0;
		for (let y = 0; y < gridH; ++y) {
			for (let x = 0; x < gridW; ++x) {
				if (grid.bugs.has(hashes[y][x])) score += i;
				i <<= 1;
			}
		}
		return score;
	};

	const seen = new Set();
	while (true) {
		step(grid);
		updateGrid(grid);
		const score = getScore();
		const isSeen = seen.has(score);
		if (isSeen) break;
		seen.add(score);
	}

	result[0] = getScore();

	grid.bugs = new Set(initialBugs.map(createHash));

	for (let i = 0; i < 200; ++i) {
		step(grid, true);
		updateGrid(grid);
	}

	const grids = [];
	let gridIter;
	for (gridIter = grid; gridIter.child; gridIter = gridIter.child);
	for (; gridIter; gridIter = gridIter.parent) {
		grids.push(gridIter);
	}

	result[1] = grids.reduce((bugs, grid) => bugs + grid.bugs.size, 0);

	sendResult();
};
