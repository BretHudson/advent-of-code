export const solution = (input) => {
	const answers = [null, null];

	const DIR_OFFSETS = [
		[0, -1], // up
		[1, 0], // right
		[0, 1], // down
		[-1, 0], // left
	];

	const treeGrid = input.split('\n').map((line, y) =>
		line.split('').map((v, x) => ({
			x,
			y,
			height: +v,
			visibleFrom: Array.from({ length: 4 }, () => true),
			isVisible: null,
			scenicScore: 1,
		})),
	);

	const gridW = treeGrid[0].length;
	const gridH = treeGrid.length;

	const move = (pos, dir) => {
		pos[0] += DIR_OFFSETS[dir][0];
		pos[1] += DIR_OFFSETS[dir][1];
	};

	treeGrid.forEach((row) => {
		row.forEach((tree) => {
			const { x, y, height, visibleFrom } = tree;

			for (let dir = 0; dir < 4; ++dir) {
				const pos = [x, y];
				move(pos, dir);

				let treesSeen = 0;
				visibleFrom[dir] = true;

				while (
					visibleFrom[dir] &&
					pos[0] >= 0 &&
					pos[1] >= 0 &&
					pos[0] < gridW &&
					pos[1] < gridH
				) {
					++treesSeen;

					visibleFrom[dir] = height > treeGrid[pos[1]][pos[0]].height;

					move(pos, dir);
				}

				tree.scenicScore *= treesSeen;
			}

			tree.isVisible = visibleFrom.some(Boolean);
		});
	});

	const trees = treeGrid.flat();

	answers[0] = trees.filter(({ isVisible }) => isVisible).length;
	answers[1] = trees.sort(
		(a, b) => b.scenicScore - a.scenicScore,
	)[0].scenicScore;

	return answers;
};
