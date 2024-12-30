importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const transform = (subject, v) => (v * subject) % 20201227;
	const getLoopSize = (key) => {
		let loops = 0;
		for (let value = 1; value !== key; ++loops) {
			value = transform(7, value);
		}
		return loops;
	};

	const publicKeys = input.split('\n').map(Number);
	const loopSizes = publicKeys.map(getLoopSize);

	const [, key] = publicKeys;
	const [loops] = loopSizes;

	result[0] = Array.from({ length: loops }).reduce(transform.bind(0, key), 1);

	sendResult();
};
