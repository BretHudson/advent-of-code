export const solution = (input) => {
	const answers = [null, null];

	const lines = input.split('\n');
	const grid = lines.map((line) => line.split('')).flat();

	let height = lines.length;
	let width = grid.length / height;

	const getIndex = (x, y) => y * width + x;
	const getPos = (index) => [index % width, Math.floor(index / width)];

	// expand the universe
	const allYPos = Array.from({ length: height }, (_, i) => i).reverse();
	for (let x = width - 1; x >= 0; --x) {
		const curColumn = allYPos.map((y) => getIndex(x, y));
		if (curColumn.every((index) => grid[index] === '.')) {
			curColumn.forEach((index) => grid.splice(index, 0, '.'));
			++width;
		}
	}

	const allXPos = Array.from({ length: width }, (_, i) => i).reverse();
	const emptyLine = Array.from({ length: width }, () => '.');
	for (let y = width - 1; y >= 0; --y) {
		const curRow = allXPos.map((x) => getIndex(x, y));
		if (curRow.every((index) => grid[index] === '.')) {
			grid.splice(getIndex(0, y), 0, ...emptyLine);
			++height;
		}
	}

	// get the positions
	const galaxies = [];
	const size = width * height;
	for (let i = 0; i < size; ++i) {
		if (grid[i] === '#') galaxies.push(getPos(i));
	}

	let sum = 0;
	for (let i = 0; i < galaxies.length; ++i) {
		for (let j = i + 1; j < galaxies.length; ++j) {
			const galaxyA = galaxies[i];
			const galaxyB = galaxies[j];
			const x = Math.abs(galaxyA[0] - galaxyB[0]);
			const y = Math.abs(galaxyA[1] - galaxyB[1]);
			sum += x + y;
		}
	}

	answers[0] = sum;

	return answers;
};
