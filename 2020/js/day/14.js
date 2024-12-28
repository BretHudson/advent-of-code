importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const parseMask = ([_, mask]) => {
		return {
			type: 'mask',
			raw: mask,
			on: BigInt(parseInt(mask.replace(/X/g, '0'), 2)),
			off: BigInt(parseInt(mask.replace(/X/g, '1'), 2)),
		};
	};

	const parseAddr = ([a, b]) => {
		return { type: 'mem', addr: +a.replace(/[^\d]/g, ''), val: BigInt(+b) };
	};

	const createFloatingMask = (mask, addr) => {
		const valStr = addr.toString(2).padStart(mask.length, '0');
		let floatingMask = '';
		for (let i = 0; i < mask.length; ++i) {
			const c = mask.at(i);
			floatingMask += c === '0' ? valStr.at(i) : c;
		}
		return floatingMask;
	};
	const instructions = input.split('\n').map((line) => {
		const instr = line.split(' = ');
		return line.startsWith('mask') ? parseMask(instr) : parseAddr(instr);
	});

	let mask = null;
	const memory = new Map();

	for (let i = 0; i < instructions.length; ++i) {
		const instr = instructions[i];
		if (instr.type === 'mask') {
			mask = instr;
		} else {
			const { addr, val } = instr;
			const res = BigInt((val & mask.off) | mask.on);
			memory.set(addr, res);
		}
	}

	result[0] = [...memory.values()].reduce((a, v) => a + v, 0n);

	memory.clear();
	for (let i = 0; i < instructions.length; ++i) {
		const instr = instructions[i];
		if (instr.type === 'mask') {
			mask = instr;
		} else {
			const floatingBits = mask.raw.replace(/[01]/g, '').length;
			const { addr, val } = instr;
			const floatingMask = createFloatingMask(mask.raw, addr);
			for (let i = 0, n = 2 ** floatingBits; i < n; ++i) {
				const bits = i
					.toString(2)
					.padStart(floatingBits, '0')
					.split('');

				let _mask = floatingMask;
				for (let b = 0; b < bits.length; ++b) {
					_mask = _mask.replace('X', bits[b]);
				}

				memory.set(BigInt(parseInt(_mask, 2)), val);
			}
		}
	}

	result[1] = [...memory.values()].reduce((a, v) => a + v, 0n);

	sendResult();
};
