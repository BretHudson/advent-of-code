importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	let regex = /\d+ <-> ([\d\s,]+)/;
	let programs = input.split('\n').map((line, index) => {
		return { id: index, connectedTo: regex.exec(line)[1].split(', ').map(val => +val) };
	});
	
	let findGroup = (programs) => {
		let connected = [ programs.splice(0, 1)[0].id ];
		let totalPrograms = programs.length;
		for (let size = 0; size !== connected.length;) {
			size = connected.length;
			for (let q = 0; q < programs.length; ++q) {
				for (let i = 0; i < size; ++i) {
					if (programs[q].connectedTo.indexOf(connected[i]) > -1) {
						connected.push(programs.splice(q--, 1)[0].id)
						break;
					}
				}
			}
		}
		return connected.length;
	};
	
	result[0] = findGroup(programs, 0);
	let groups = 1;
	while (programs.length > 0) {
		findGroup(programs);
		++groups;
	}
	result[1] = groups;
	
	callback(result);
});