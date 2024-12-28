importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const DIR = {
		N: 0,
		E: 1,
		S: 2,
		W: 3,
	};

	const tiles = input.split('\n\n').map((block) => {
		const [_id, ...rows] = block.split('\n');
		const id = +_id.replace(/[^\d]/g, '');
		const grid = rows.map((line) => line.split(''));

		const gridW = rows[0].length;
		const gridH = rows.length;
		const topBorder = rows[0];
		const bottomBorder = rows[gridH - 1].split('').reverse().join('');
		let leftBorder = '';
		let rightBorder = '';
		for (let i = 0; i < gridH; ++i) {
			leftBorder += grid[i][0];
			rightBorder += grid[i][gridW - 1];
		}
		leftBorder = leftBorder.split('').reverse().join('');

		const tile = {
			id,
			grid,
			borders: [topBorder, rightBorder, bottomBorder, leftBorder],
			matches: Array.from({ length: 4 }, () => []),
			left: null,
			right: null,
			top: null,
			bottom: null,
			oriented: false,
		};

		return tile;
	});

	const transpose = (arr) => {
		return arr[0].map((_, colIndex) => arr.map((row) => row[colIndex]));
	};

	const reverseRows = (arr) => {
		return arr.map((row) => row.reverse());
	};

	const rotate = (tile, dir) => {
		const sign = Math.sign(dir);
		for (let i = dir; i !== 0; i -= sign) {
			if (sign < 0) {
				tile.grid = reverseRows(tile.grid);
				const border = tile.borders.shift();
				const match = tile.matches.shift();
				tile.borders.push(border);
				tile.matches.push(match);
			}

			tile.grid = transpose(tile.grid);

			if (sign > 0) {
				tile.grid = reverseRows(tile.grid);
				const border = tile.borders.pop();
				const match = tile.matches.pop();
				tile.borders.unshift(border);
				tile.matches.unshift(match);
			}
		}
	};

	const flipH = (tile) => {
		tile.grid = reverseRows(tile.grid);

		let temp = tile.borders[1];
		tile.borders[0] = tile.borders[0];
		tile.borders[1] = tile.borders[3];
		tile.borders[2] = tile.borders[2];
		tile.borders[3] = temp;

		tile.borders = tile.borders.map((b) => b.split('').reverse().join(''));

		temp = tile.matches[1];
		tile.matches[1] = tile.matches[3];
		tile.matches[3] = temp;
	};

	const flipV = (tile) => {
		tile.grid = transpose(tile.grid);
		tile.grid = reverseRows(tile.grid);
		tile.grid = transpose(tile.grid);

		let temp = tile.borders[0];
		tile.borders[0] = tile.borders[2];
		tile.borders[1] = tile.borders[1];
		tile.borders[2] = temp;
		tile.borders[3] = tile.borders[3];

		tile.borders = tile.borders.map((b) => b.split('').reverse().join(''));

		temp = tile.matches[0];
		tile.matches[0] = tile.matches[2];
		tile.matches[2] = temp;
	};

	const renderTiles = (...tiles) => {
		const [tile] = tiles;
		const gridW = tile.grid[0].length;
		const gridH = tile.grid.length;
		let lines = [];
		for (let y = 1; y < gridH - 1; ++y) {
			const line = tiles.flatMap((tile) => {
				return tile.grid[y].slice(1, gridW - 1);
			});
			lines.push(line);
		}
		return lines;
	};

	const renderAllTiles = (tile) => {
		const lines = [];
		for (let vPointer = tile; vPointer; vPointer = vPointer.bottom) {
			const tiles = [];
			for (let hPointer = vPointer; hPointer; hPointer = hPointer.right) {
				tiles.push(hPointer);
			}
			lines.push(...renderTiles(...tiles));
		}
		return lines;
	};

	const compareBorders = (a, b) => {
		const aR = a.split('').reverse().join('');
		const bR = b.split('').reverse().join('');
		return a === b || aR === b || a === bR;
	};

	for (let i = 0; i < tiles.length; ++i) {
		const tileA = tiles[i];
		for (let j = i + 1; j < tiles.length; ++j) {
			const tileB = tiles[j];
			for (let a = 0; a < 4; ++a) {
				for (let b = 0; b < 4; ++b) {
					if (compareBorders(tileA.borders[a], tileB.borders[b])) {
						tileA.matches[a].push([tileB, b]);
						tileB.matches[b].push([tileA, a]);
					}
				}
			}
		}
	}

	const corners = tiles.filter(
		({ matches }) => matches.filter((m) => m.length).length === 2,
	);

	result[0] = corners.map(({ id }) => id).reduce((acc, v) => acc * v, 1);

	const [topLeftCorner] = corners;
	if (topLeftCorner.matches[0].length && !topLeftCorner.matches[3].length)
		flipV(topLeftCorner);
	if (topLeftCorner.matches[3].length && !topLeftCorner.matches[0].length)
		flipH(topLeftCorner);
	while (topLeftCorner.matches[0].length) {
		rotate(topLeftCorner, 1);
	}
	topLeftCorner.oriented = true;

	const findMatch = (tile, direction) => {
		const [match] = tile.matches[direction];
		if (!match) return;

		const [otherTile, borderIndex] = match;

		if (!otherTile.oriented) {
			const targetDir = (direction + 2) % 4;
			rotate(otherTile, targetDir - borderIndex);

			if (tile.borders[direction] === otherTile.borders[targetDir]) {
				switch (direction) {
					case DIR.N:
					case DIR.S:
						flipH(otherTile);
						break;
					case DIR.E:
					case DIR.W:
						flipV(otherTile);
						break;
				}
			}
			otherTile.oriented = true;
		}

		switch (direction) {
			case DIR.N:
				tile.top = otherTile;
				otherTile.bottom = tile;
				break;
			case DIR.E:
				tile.right = otherTile;
				otherTile.left = tile;
				break;
			case DIR.S:
				tile.bottom = otherTile;
				otherTile.top = tile;
				break;
			case DIR.W:
				tile.left = otherTile;
				otherTile.right = tile;
				break;
		}

		return otherTile;
	};

	const queue = [topLeftCorner];
	const visited = new Set([topLeftCorner.id]);
	while (queue.length) {
		const tile = queue.shift();
		[DIR.E, DIR.S].forEach((dir) => {
			const neighbor = findMatch(tile, dir);
			if (neighbor && !visited.has(neighbor.id)) {
				visited.add(neighbor.id);
				queue.push(neighbor);
			}
		});
	}

	const seaMonster = [
		'                  # ',
		'#    ##    ##    ###',
		' #  #  #  #  #  #   ',
	];
	const monsterW = seaMonster[0].length;
	const monsterH = seaMonster.length;
	const seaMonsterPoints = [];
	for (let y = 0; y < monsterH; ++y) {
		for (let x = 0; x < monsterW; ++x) {
			if (seaMonster[y][x] === '#') {
				seaMonsterPoints.push([x, y]);
			}
		}
	}

	let picture = renderAllTiles(topLeftCorner);
	const pictureW = picture[0].length;
	const pictureH = picture.length;

	const findMonster = (x, y) => {
		const check = seaMonsterPoints.map(([pX, pY]) => [x + pX, y + pY]);
		if (check.every(([x, y]) => picture[y][x] !== '.')) {
			check.forEach(([x, y]) => (picture[y][x] = 'O'));
		}
	};

	for (let flips = 0; flips < 2; ++flips) {
		for (let rotations = 0; rotations < 4; ++rotations) {
			for (let y = 0; y < pictureH - monsterH; ++y) {
				for (let x = 0; x < pictureW - monsterW; ++x) {
					findMonster(x, y);
				}
			}

			picture = transpose(picture);
			picture = reverseRows(picture);
		}

		picture = reverseRows(picture);
	}

	result[1] = picture.flat().filter((c) => c === '#').length;

	sendResult();
};
