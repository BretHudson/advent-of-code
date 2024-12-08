export const solution = (input) => {
	const answers = [null, null];

	const antennas = {};

	const grid = input.split('\n').map((line) => line.split(''));

	const gridW = grid[0].length;
	const gridH = grid.length;

	grid.flat().forEach((cell, i) => {
		if (cell === '.') return;

		const x = i % gridW;
		const y = Math.floor(i / gridW);
		antennas[cell] ??= [];
		antennas[cell].push([x, y]);
	});

	const antiNodes = new Set();
	const allAntiNodes = new Set();

	Object.values(antennas).forEach((nodes) => {
		for (let i = 0; i < nodes.length; ++i) {
			allAntiNodes.add(nodes[i].join(','));

			for (let j = 0; j < nodes.length; ++j) {
				if (i === j) continue;

				const dX = nodes[j][0] - nodes[i][0];
				const dY = nodes[j][1] - nodes[i][1];

				let [newX, newY] = nodes[j];
				newX += dX;
				newY += dY;

				let first = true;
				while (newX >= 0 && newY >= 0 && newX < gridW && newY < gridH) {
					if (first) {
						antiNodes.add([newX, newY].join(','));
						first = false;
					}
					allAntiNodes.add([newX, newY].join(','));
					newX += dX;
					newY += dY;
				}
			}
		}
	});

	answers[0] = antiNodes.size;
	answers[1] = allAntiNodes.size;

	return answers;
};
