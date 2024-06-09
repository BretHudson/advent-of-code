export const solution = (input) => {
	const answers = [null, null];

	const grid = input.split('\n').map((v) => v.split(''));

	const width = grid[0].length;
	const height = grid.length;

	const beams = [];
	const createBeam = (pos, dir) => {
		const beam = { pos, dir };
		beams.push(beam);
		return beam;
	};

	const v2add = (a, b) => a.map((v, i) => v + (b[i] ?? 0));

	const deleteBeam = (beam) => {
		beams.splice(beams.indexOf(beam), 1);
	};

	const splitBeam = (beam) => {
		deleteBeam(beam);
		const { pos, dir } = beam;
		const [xVel, yVel] = dir;
		createBeam(pos, [yVel, xVel]);
		createBeam(pos, [-yVel, -xVel]);
	};

	const rotateBeam = (beam, rotations) => {
		for (let i = 0, n = (4 + rotations) % 4; i < n; ++i) {
			const [xVel, yVel] = beam.dir;
			beam.dir = [yVel, -xVel];
		}
	};

	const exploreGrid = (pos, dir) => {
		createBeam(pos, dir);

		const energizedGrid = input.split('\n').map((v) => v.split(''));
		const visited = new Map();
		while (beams.length) {
			beams.forEach((beam) => {
				beam.pos = v2add(beam.pos, beam.dir);

				const [x, y] = beam.pos;
				if (x < 0 || y < 0 || x >= width || y >= height) {
					deleteBeam(beam);
					return;
				}

				const hash = [beam.pos, beam.dir].join(',');
				if (visited.has(hash)) {
					deleteBeam(beam);
					return;
				}
				visited.set(hash);

				const [xVel, yVel] = beam.dir;

				switch (grid[y][x]) {
					case '|':
						if (xVel) splitBeam(beam);
						break;
					case '-':
						if (yVel) splitBeam(beam);
						break;
					case '/':
						if (xVel) rotateBeam(beam, 1);
						else rotateBeam(beam, -1);
						break;
					case '\\':
						if (xVel) rotateBeam(beam, -1);
						else rotateBeam(beam, 1);
						break;
				}

				energizedGrid[y][x] = '#';
			});
		}

		return energizedGrid.flat().filter((v) => v === '#').length;
	};

	answers[0] = exploreGrid([-1, 0], [1, 0]);

	const configurations = [];
	for (let x = 0; x < width; ++x) {
		configurations.push([
			[x, -1],
			[0, 1],
		]);
		configurations.push([
			[x, height],
			[0, -1],
		]);
	}
	for (let y = 0; y < height; ++y) {
		configurations.push([
			[-1, y],
			[1, 0],
		]);
		configurations.push([
			[width, y],
			[-1, 0],
		]);
	}

	// this could be sped up by caching the result of the amount of the grid energzied when hitting a surface, which would require a refactor
	// brute force gets it done :)
	const energies = configurations.map((args) => exploreGrid(...args));
	answers[1] = Math.max(...energies);

	return answers;
};
