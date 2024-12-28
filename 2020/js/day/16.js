importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const [rangeInput, ...ticketInput] = input
		.split('\n\n')
		.map((v) => v.split('\n'));

	const ranges = rangeInput.map((line, index) => {
		const [name, spansStr] = line.split(': ');
		const spans = spansStr.split(' or ').map((span) => {
			return span.split('-').map(Number);
		});
		return { index, name, spans };
	});

	const tickets = ticketInput
		.flat()
		.filter((line) => line.includes(','))
		.map((line) => ({
			fields: line.split(',').map(Number),
			fits: line.split(',').map(() => []),
			invalids: [],
		}));

	const fieldCount = tickets[0].fields.length;

	const inRange = (v, range) => v >= range[0] && v <= range[1];

	tickets.forEach(({ fields, fits, invalids }) => {
		fields.forEach((field, index) => {
			const fitsArr = fits[index];

			for (let r = 0; r < ranges.length; ++r) {
				if (ranges[r].spans.some((range) => inRange(field, range))) {
					fitsArr.push(ranges[r].name);
				}
			}

			if (fitsArr.length === 0) {
				invalids.push(field);
			}
		});
	});

	const invalidTickets = tickets.filter(({ invalids }) => invalids.length);
	const validTickets = tickets.filter(({ invalids }) => !invalids.length);

	const fieldMap = Array.from({ length: fieldCount }, () => null);

	const maps = [];

	for (let f = 0; f < fieldCount; ++f) {
		const map = Object.fromEntries(ranges.map(({ name }) => [name, 0]));
		validTickets.forEach(({ fits }) => {
			fits[f].forEach((f) => ++map[f]);
		});

		ranges.forEach(({ name }) => {
			if (map[name] !== validTickets.length) delete map[name];
		});

		maps.push(map);
	}

	const queue = fieldMap.map((_, i) => i);
	while (queue.length) {
		const index = queue.shift();
		const map = maps[index];
		const possibleMatches = Object.keys(map);
		if (possibleMatches.length > 1) {
			queue.push(index);
			continue;
		}

		const name = possibleMatches[0];
		maps.forEach((map) => delete map[name]);
		fieldMap[index] = name;
	}

	const departureFields = [];
	for (let i = 0; i < fieldMap.length; ++i) {
		const fieldName = fieldMap[i];
		if (!fieldName.startsWith('departure')) continue;

		departureFields.push(tickets[0].fields[i]);
	}

	result[0] = invalidTickets
		.flatMap(({ invalids }) => invalids)
		.reduce((a, v) => a + v, 0);
	result[1] = departureFields.reduce((a, v) => a * v, 1);

	sendResult();
};
