export const solution = (input) => {
	const answers = [null, null];

	const data = input.split('').map(Number);

	console.time('one');
	const blocks = [];

	for (let i = 0; i < data.length; ++i) {
		if (i % 2 === 0) {
			blocks.push(...Array.from({ length: data[i] }, () => i / 2));
		} else {
			blocks.push(...Array.from({ length: data[i] }, () => '.'));
		}
	}

	{
		const _blocks = [...blocks];

		for (let i = _blocks.length - 1; i >= 0; --i) {
			let firstFree = _blocks.indexOf('.');
			if (firstFree > i) break;
			if (_blocks[i] !== '.') {
				_blocks[firstFree] = _blocks[i];
				_blocks[i] = '.';
			}
		}

		answers[0] = _blocks.reduce(
			(acc, v, i) => (v !== '.' ? acc + v * i : acc),
			0,
		);
	}
	console.timeEnd('one');

	console.time('two');
	{
		const indices = Array.from(
			{ length: Math.ceil(data.length / 2) },
			(_, i) => {
				const start = blocks.indexOf(i);
				const end = blocks.lastIndexOf(i);
				return {
					index: start,
					length: end - start + 1,
				};
			},
		).reverse();

		for (let i = 0; i < indices.length; ++i) {
			const { index, length } = indices[i];

			let emptyIndex = -1;
			let emptyLength = 0;
			for (let j = 0; j < blocks.length; ++j) {
				if (blocks[j] === '.') {
					if (emptyIndex === -1) {
						emptyIndex = j;
					}
					++emptyLength;

					if (blocks.slice(j, j + length).every((b) => b === '.')) {
						emptyLength = length;
						break;
					}
				} else if (emptyIndex !== -1) {
					if (emptyLength < length) {
						emptyIndex = -1;
						emptyLength = 0;
					} else {
						break;
					}
				}
			}

			if (emptyIndex > -1 && emptyIndex < index) {
				for (let j = emptyIndex; j < emptyIndex + length; ++j) {
					blocks[j] = indices.length - i - 1;
				}
				for (let j = index; j < index + length; ++j) {
					blocks[j] = '.';
				}
			}
		}

		answers[1] = blocks.reduce(
			(acc, v, i) => (v !== '.' ? acc + v * i : acc),
			0,
		);
	}
	console.timeEnd('two');

	return answers;
};
