importScripts('baseWorker.js');

onmessage = onmessagefunc(11, 'Radioisotope Thermoelectric Generators', (input, callback) => {
		let generatorRegex = /(\w+) generator/g;
		let microchipRegex = /(\w+)-compatible microchip/g;
		let elems = [];
		let getElemType = (elem) => {
			if (elems.indexOf(elem) === -1) elems.push(elem);
			return elems.indexOf(elem);
		};

		const STR_GENERATOR = 'generator';
		const STR_MICROCHIP = 'microchip';

		let copy = ([floors, e, steps = 0]) => [floors.map((f) => [...f]), e, steps];

		let removeFromArray = (arr, item) => {
			let index = arr.indexOf(item);
			if (index === -1) return;
			arr.splice(index, 1);
		};

		let isValid = ([floors, elevator]) => {
			let elevatorValid = floors[elevator].length > 0;

			let validChips = floors.flatMap((items) => items.map((i) => {
				if (i[1] === STR_GENERATOR) return true;

				let hasShield = items.some((o) => o[0] === i[0] && o[1] === STR_GENERATOR);

				return hasShield || !items.some((o) => o[1] === STR_GENERATOR);
			})).reduce((acc, v) => acc && v, true);

			return validChips && elevatorValid;
		};

		let getAllCombos = (items) => {
			let result = [];
			for (let i = 0; i < items.length; ++i) {
				for (let j = i + 1; j < items.length; ++j) {
					result.push([items[i], items[j]]);
				}
			}
			result.push(...items.map((i) => [i]));
			return result;
		};

		let moveItems = (state, items, dir) => {
			let floors = state[0],
				floorId = state[1];
			items.forEach((item) => {
				removeFromArray(floors[floorId], item);
				floors[floorId + dir].push(item);
			});
			state[1] += dir;
			++state[2];
		};

		let solve = (initialState) => {
			let objects = Array.from({ length: elems.length }, () => []);
			let serialize = ([floors, e]) => {
				for (let floor = 0; floor < 4; ++floor) {
					let items = floors[floor];
					for (let i = 0; i < items.length; ++i) {
						let [_, type, elem] = items[i];
						let index = getElemType(elem);
						objects[index][+(type !== STR_GENERATOR)] = floor;
					}
				}
				return [objects.map((o) => o.join(':')).sort().join(','), e].join(',');
			};

			let queue = [copy(initialState)];
			let seen = new Set();
			let states = [];

			while (queue.length) {
				let curState = queue.shift();
				let key = serialize(curState);

				if (seen.has(key)) continue;
				seen.add(key);

				let stateId = states.length;
				states.push(curState);

				if (!isValid(curState)) continue;

				// check if end state
				let [floors, elevatorFloor, steps] = curState;
				let finished = floors.slice(0, -1).every((floor) => floor.length === 0);
				if (finished) return steps;

				// get next moves
				let curFloor = floors[elevatorFloor];
				let combos = getAllCombos(curFloor);
				let shouldMoveDown = floors.slice(0, elevatorFloor).some((floor) => floor.length > 0);
				for (let i = 0, n = combos.length; i < n; ++i) {
					let combo = combos[i];
					if (elevatorFloor < floors.length - 1) {
						let newState = copy(curState);
						moveItems(newState, combo, 1);
						newState[3] = stateId;
						queue.push(newState);
					}
					if (elevatorFloor > 0 && shouldMoveDown) {
						let newState = copy(curState);
						moveItems(newState, combo, -1);
						newState[3] = stateId;
						queue.push(newState);
					}
				}
			}
		};

		let floors = input.split('\n').map((line) => {
			let [_, items] = line.split(' contains ');
			let floor = [];

			let matches;
			while ((matches = generatorRegex.exec(items))) {
				let elem = matches[1].charAt(0).toUpperCase();
				getElemType(elem);
				floor.push([matches[1], STR_GENERATOR, elem]);
			}
			while ((matches = microchipRegex.exec(items))) {
				let elem = matches[1].charAt(0).toUpperCase();
				getElemType(elem);
				floor.push([matches[1], STR_MICROCHIP, elem]);
			}

			return floor;
		});

		let result = [null, null];

		let initialState = [floors, 0];
		result[0] = solve(initialState);

		let EG = ['elerium', STR_GENERATOR, 'E'];
		let EM = ['elerium', STR_MICROCHIP, 'E'];
		let DG = ['dilithium', STR_GENERATOR, 'D'];
		let DM = ['dilithium', STR_MICROCHIP, 'D'];
		getElemType(EG[2]);
		getElemType(DG[2]);
		let expandedState = copy(initialState);
		expandedState[0][0].push(EG, EM, DG, DM);
		result[1] = solve(expandedState);

		callback(result);
	},
);
