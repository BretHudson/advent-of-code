export const solution = (input) => {
	const answers = [null, null];

	const sequence = input.replaceAll('\n', '').split(',');

	const hash = (string) => {
		let curVal = 0;
		for (let i = 0; i < string.length; ++i) {
			const charCode = string.charCodeAt(i);
			curVal += charCode;
			curVal *= 17;
			curVal %= 256;
		}
		return curVal;
	};

	answers[0] = sequence.map(hash).reduce((a, v) => a + v, 0);

	const boxes = Array.from({ length: 256 }, () => []);
	sequence.forEach((step) => {
		let [label, value] = step.split('=');
		label = label.split('-')[0];
		const index = hash(label);
		const box = boxes[index];
		const lensIndex = box.findIndex((lens) => lens[0] === label);
		const lens = box[lensIndex];
		if (value) {
			if (lensIndex > -1) {
				lens[1] = value;
			} else {
				box.push([label, value]);
			}
		} else {
			if (lensIndex > -1) {
				box.splice(lensIndex, 1);
			}
		}
	});

	answers[1] = boxes
		.map((box, i) =>
			box
				.map(([_, focalLength], lensIndex) => {
					return [i + 1, lensIndex + 1, focalLength].reduce(
						(a, v) => a * v,
						1,
					);
				})
				.reduce((a, v) => a + v, 0),
		)
		.reduce((a, v) => a + v, 0);

	return answers;
};
