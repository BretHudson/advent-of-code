export const solution = (input) => {
	const answers = [null, null];

	let registerX = 1;

	const instructions = input.split('\n').map((line) => {
		const [op, ...args] = line.split(' ');
		return [op, ...args.map(Number)];
	});

	const CRT_W = 40;
	const CRT_H = 6;
	const crt = Array.from({ length: CRT_H }, () => {
		return Array.from({ length: CRT_W }, () => '.');
	});

	const updateCRT = (pixel) => {
		const x = pixel % CRT_W;
		const y = Math.floor(pixel / CRT_W);
		if (Math.abs(registerX - x) < 2) {
			crt[y][x] = '#';
		}
	};

	const renderCRT = () => {
		return crt.map((row) => row.join('')).join('\n');
	};

	let cycleCount = 0;
	const period = 40;
	let nextTarget = 20;
	let accSignalStrength = 0;

	instructions.map(([instruction, cycles]) => {
		switch (instruction) {
			case 'noop':
				updateCRT(cycleCount);
				++cycleCount;
				break;
			case 'addx':
				updateCRT(cycleCount);
				updateCRT(cycleCount + 1);
				if (cycleCount + 2 >= nextTarget) {
					const signalStrength = nextTarget * registerX;
					accSignalStrength += signalStrength;
					nextTarget += period;
				}
				cycleCount += 2;
				registerX += cycles;
				break;
		}
	});

	answers[0] = accSignalStrength;
	answers[1] = renderCRT();

	return answers;
};
