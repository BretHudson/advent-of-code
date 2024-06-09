export const solution = (input) => {
	const answers = [null, null];

	const grid = input.split('\n').map((v) => v.split(''));
	const energizedGrid = input.split('\n').map((v) => v.split(''));

	const width = grid[0].length;
	const height = grid.length;

	const beams = [];
	const createBeam = (pos, dir) => {
		const beam = { pos, dir };
		beams.push(beam);
		return beam;
	};

	const v2add = (a, b) => a.map((v, i) => v + (b[i] ?? 0));

	createBeam([-1, 0], [1, 0]);

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

	const rotateDir = (dir, rotations) => {
		let newDir = dir;
		for (let i = 0, n = (4 + rotations) % 4; i < n; ++i) {
			const [xVel, yVel] = newDir;
			newDir = [yVel, -xVel];
		}
		return newDir;
	};

	const rotateBeam = (beam, rotations) => {
		beam.dir = rotateDir(beam.dir, rotations);
	};

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

	answers[0] = energizedGrid.flat().filter((v) => v === '#').length;

	return answers;
};
