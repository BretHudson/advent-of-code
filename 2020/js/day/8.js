importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const ops = {
		acc: (acc, val, iter) => [acc + val, ++iter],
		jmp: (acc, val, iter) => [acc, iter + val],
		nop: (acc, val, iter) => [acc, ++iter],
	};

	const _runOp = (op, val, acc, iter) => op(acc, val, iter);
	const runOp = (ops, iter) => (acc) => _runOp(...ops[iter], acc, iter);

	const inputs = input.split('\n').map((v) => {
		const [opcode, val] = v.split(' ');
		return [ops[opcode], +val];
	});

	const execute = (inputs) => {
		let terminated = true;
		const iterate = (ops, visited, acc, iter) => {
			if (visited.includes(iter)) {
				terminated = false;
				return acc;
			}

			return ops[iter]
				? iterate(ops, [...visited, iter], ...runOp(ops, iter)(acc))
				: acc;
		};

		const finalAcc = iterate(inputs, [], 0, 0);
		return { acc: finalAcc, terminated };
	};

	result[0] = execute([...inputs]).acc;

	for (let i = 0; i < inputs.length; ++i) {
		const prev = inputs[i][0];
		if (prev === ops.acc) continue;
		inputs[i][0] = inputs[i][0] === ops.jmp ? ops.nop : ops.jmp;

		const program = execute(inputs);
		if (program.terminated) {
			result[1] = program.acc;
			break;
		}

		inputs[i][0] = prev;
	}

	sendResult();
};
