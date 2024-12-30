importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const initialSignal = input.split('').map(Number);
	const offset = +initialSignal.slice(0, 7).join('');

	const pattern = [0, 1, 0, -1];
	const runFFT = (signal) => {
		for (let phase = 0; phase < 100; ++phase) {
			const newSignal = [];
			for (let digit = 1; digit <= signal.length; ++digit) {
				let value = 0;
				for (let i = 0; i < signal.length; ++i) {
					const index = Math.floor((i + 1) / digit);
					value += signal[i] * pattern[index % pattern.length];
				}
				newSignal.push(Math.abs(value) % 10);
			}
			signal = newSignal;
		}
	};

	const signal = [...initialSignal];
	runFFT(signal);
	result[0] = signal.slice(0, 8).join('');

	const bigSignal = input.repeat(10000).split('').map(Number);

	for (let phase = 0; phase < 100; ++phase) {
		for (let sum = 0, j = bigSignal.length - 1; j >= offset; --j) {
			sum += bigSignal[j];
			bigSignal[j] = Math.abs(sum) % 10;
		}
	}

	result[1] = bigSignal.slice(offset, offset + 8).join('');

	sendResult();
};
