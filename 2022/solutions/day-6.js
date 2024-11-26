export const solution = (input) => {
	const answers = [null, null];

	const set = new Set();

	let startOfPacketMarker;
	for (let i = 0; i < input.length - 3; ++i) {
		const str = input.substring(i, i + 4);
		str.split('').forEach(set.add.bind(set));
		if (set.size === 4) {
			startOfPacketMarker = i + 4;
			break;
		}

		set.clear();
	}

	answers[0] = startOfPacketMarker;

	let startOfMessageMarker;
	for (let i = 0; i < input.length - 13; ++i) {
		const str = input.substring(i, i + 14);
		str.split('').forEach(set.add.bind(set));
		if (set.size === 14) {
			startOfMessageMarker = i + 14;
			break;
		}

		set.clear();
	}

	answers[1] = startOfMessageMarker;

	return answers;
};
