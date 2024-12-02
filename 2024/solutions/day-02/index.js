export const solution = (input) => {
	const answers = [null, null];

	const reports = input
		.split('\n')
		.map((line) => line.split(' ').map(Number))
		.map((report) => {
			return report[0] > report.at(-1) ? report.toReversed() : report;
		});

	const getDeltas = (report) =>
		report.map((v, i) => report[i + 1] - v).slice(0, -1);

	const validateDeltas = (deltas) => deltas.every((d) => d >= 1 && d <= 3);

	answers[0] = reports.map(getDeltas).filter(validateDeltas).length;

	/// first pass, before I gave a clever math-oriented solution a second go
	answers[1] = reports.filter((report) => {
		for (let i = 0; i < report.length; ++i) {
			if (validateDeltas(getDeltas(report.toSpliced(i, 1)))) return true;
		}
		return false;
	}).length;

	// second pass
	let count = 0;
	for (let report of reports) {
		const deltas = getDeltas(report);
		const checkDeltas = (index) => {
			const newDelta = deltas[index] + deltas[index + 1];
			return newDelta >= 1 && newDelta <= 3;
		};

		const errorDeltas = [];
		for (let i = 0; i < deltas.length; ++i) {
			if (deltas[i] <= 0 || deltas[i] > 3) {
				errorDeltas.push(i);
			}
		}

		let safe = errorDeltas.length === 0;
		if (errorDeltas.length === 1) {
			const deltaIndex = errorDeltas[0];
			safe =
				deltaIndex === 0 ||
				deltaIndex === deltas.length - 1 ||
				(deltaIndex > 0 && checkDeltas(deltaIndex - 1)) ||
				(deltaIndex < deltas.length - 1 && checkDeltas(deltaIndex));
		} else if (errorDeltas.length === 2) {
			const a = errorDeltas[0];
			const b = errorDeltas[1];
			safe = (b === 1 || a === deltas.length - 2) && checkDeltas(a);
		}

		if (safe) ++count;
	}

	answers[1] = count;

	return answers;
};
