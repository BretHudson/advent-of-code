importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	let computeTotalWeight = (program) => {
		program.subWeight = 0;
		for (let sub of program.subprograms) {
			program.subWeight += computeTotalWeight(sub);
		}
		program.totalWeight = program.subWeight + program.weight;
		return program.totalWeight;
	};
	
	let findUnbalancedProgram = (program) => {
		if (program.subprograms.length === 0) return null;
		program.subprograms.sort((a, b) => Math.sign(a.totalWeight - b.totalWeight));
		let targetWeight = program.subprograms[1].totalWeight;
		let result = null;
		for (let sub of program.subprograms) {
			let diff = targetWeight - sub.totalWeight;
			if (diff !== 0) {
				result = sub.weight + diff;
				break;
			}
		}
		
		let subresult = null;
		for (let sub of program.subprograms) {
			subresult = findUnbalancedProgram(sub);
			if (subresult !== null) break;
		}
		
		return subresult || result;
	};
	
	let regex = /(\w+) \((\d+)\)(?: -> ([\w\s,]+))?/
	let matches;
	let programs = input.split('\n').map(line => {
		matches = regex.exec(line);
		let subprograms = (matches[3] !== undefined) ? matches[3].split(', ') : [];
		return {
			name: matches[1],
			totalWeight: 0,
			weight: +matches[2],
			subprograms: subprograms
		};
	});
	
	let names = programs.map(program => program.name);
	
	let temp = [];
	for (let prog of programs)
		temp[prog.name] = prog;
	programs = temp;
	
	for (let [name, program] of Object.entries(programs)) {
		let subprograms = [];
		while (program.subprograms.length > 0) {
			let subName = program.subprograms.shift();
			subprograms.push(programs[subName]);
			names.splice(names.indexOf(subName), 1);
		}
		program.subprograms = subprograms;
	}
	
	let baseProgram = programs[names[0]];
	computeTotalWeight(baseProgram);
	
	result[0] = baseProgram.name;
	result[1] = findUnbalancedProgram(baseProgram);
	
	callback(result);
});
/*
let names = programs.map(program => program.name);
	programs.forEach(program => {
		let subprograms = [];
		while (program.subprograms.length > 0) {
			let sub = program.subprograms.shift();
			for (let prog of programs) {
				if (prog.name === sub) {
					names.splice(names.indexOf(sub), 1);
					subprograms.push(prog);
				}
			}
		}
		program.subprograms = subprograms;
	});*/