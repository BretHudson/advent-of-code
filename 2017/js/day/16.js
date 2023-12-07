importScripts('./../baseWorker.js');
onmessage = onmessagefunc((input, callback) => {
	let result = [ null, null ];
	
	// NOTE(bret): Using an array would be too simple :)
	
	let generatePrograms = (size) => {
		let lastProgram = null;
		for (let i = 0; i < size; ++i)
			lastProgram = { value: String.fromCharCode(97 + i), prev: lastProgram, next: null };
		
		let iter = lastProgram;
		let next = iter;
		while (iter.prev !== null) {
			iter = iter.prev;
			iter.next = next;
			next = iter;
		}
		
		iter.prev = lastProgram;
		lastProgram.next = iter;
		
		return iter;
	};
	
	let runMoves = (head) => {
		for (let move of moves) {
			switch (move.type) {
				case 's': {
					for (let i = 0; i < move.values[0]; ++i)
						head = head.prev;
				} break;
				
				case 'x': {
					swapPrograms(head, move.values[0], move.values[1]);
				} break;
				
				case 'p': {
					let A = findIndex(head, move.values[0]);
					let B = findIndex(head, move.values[1]);
					swapPrograms(head, A, B);
				} break;
			}
		}
		return head;
	};
	
	let getProgramBasedOnOffset = (head, offset) => {
		for (let i = 0; i < offset; ++i)
			head = head.next;
		return head;
	};
	
	let findIndex = (head, value) => {
		let i = 0;
		for (; head.value !== value; ++i, head = head.next);
		return i;
	};
	
	let swapPrograms = (head, A, B) => {
		let programA = getProgramBasedOnOffset(head, A);
		let programB = getProgramBasedOnOffset(head, B);
		
		let temp = programA.value;
		programA.value = programB.value;
		programB.value = temp;
	};
	
	let printOrder = (head) => {
		let str = '';
		let iter = head;
		do {
			str += iter.value;
		} while ((iter = iter.next) !== head);
		return str;
	};
	
	let moves = input.split(',').map(move => {
		let values = move.substring(1);
		return {
			type: move.charAt(0),
			values: values.split('/').sort()
		};
	});
	
	let numPrograms = 16;
	let head = generatePrograms(numPrograms);
	let startSequence = printOrder(head);
	
	head = runMoves(head, moves);
	
	result[0] = printOrder(head);
	
	let numRuns = 1000000000;
	let repeatsAt;
	for (repeatsAt = 1; printOrder(head) !== startSequence; ++repeatsAt)
		head = runMoves(head, moves);
	
	for (let r = 0, runs = numRuns % repeatsAt; r < runs; ++r)
		head = runMoves(head, moves);
	
	result[1] = printOrder(head);
	
	callback(result);
});