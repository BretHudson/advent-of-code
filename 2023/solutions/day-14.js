export const solution = (input) => {
	const answers = [null, null];

	const grid = input.split('\n').map((v) => v.split(''));

	const width = grid[0].length;
	const height = grid.length;

	for (let x = 0; x < width; ++x) {
		let firstEmpty = 0;
		let slide = 0;
		for (let y = 0; y < height; ++y) {
			switch (grid[y][x]) {
				case 'O':
					if (slide) {
						grid[y - slide][x] = 'O';
						grid[y][x] = '.';
					}
					break;
				case '.':
					++slide;
					break;
				case '#':
					firstEmpty = y + 1;
					slide = 0;
					break;
			}
		}
	}

	let load = 0;
	for (let y = 0; y < height; ++y) {
		const score = height - y;
		for (let x = 0; x < width; ++x) {
			if (grid[y][x] === 'O') {
				load += score;
			}
		}
	}

	answers[0] = load;

	return answers;
};
