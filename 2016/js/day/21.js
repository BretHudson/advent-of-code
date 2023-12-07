importScripts('baseWorker.js');
onmessage = onmessagefunc(21, 'Scrambled Letters and Hash', (input, callback) => {
	let result = [ null, null ];
	
	const swap = (a, b, password) => {
		let temp = password[a];
		password[a] = password[b];
		password[b] = temp;
	};
	
	let instructions = input.split('\n');
	
	let scramble = (password) => {
		password = password.split('');
		
		instructions.forEach(line => {
			let parts = line.split(' ');
			switch (parts[0]) {
				case 'swap': {
					let a = (isNaN(parts[2])) ? password.indexOf(parts[2]) : +parts[2];
					let b = (isNaN(parts[5])) ? password.indexOf(parts[5]) : +parts[5];
					swap(a, b, password);
				} break;
				
				case 'rotate': {
					switch (parts[1]) {
						case 'left': {
							let steps = +parts[2];
							for (let i = 0; i < steps; ++i)
								password.push(password.shift());
						} break;
						
						case 'right': {
							let steps = +parts[2];
							for (let i = 0; i < steps; ++i)
								password.unshift(password.pop());
						} break;
						
						default: {
							let index = password.indexOf(parts[6]);
							let steps = index + 1;
							if (index >= 4) ++steps;
							for (let i = 0; i < steps; ++i)
								password.unshift(password.pop());
						} break;
					}
				} break;
				
				case 'reverse': {
					let a = +parts[2];
					let b = +parts[4];
					let half = Math.ceil((b - a) / 2);
					for (let i = 0; i < half; ++i)
						swap(a + i, b - i, password);
				} break;
				
				case 'move': {
					password.splice(+parts[5], 0, password.splice(+parts[2], 1)[0]);
				} break;
			}
		});
		
		return password.join('');
	};
	
	let unscramble = (password) => {
		password = password.split('');
		
		instructions.reverse().forEach(line => {
			let parts = line.split(' ');
			switch (parts[0]) {
				case 'swap': {
					let a = (isNaN(parts[2])) ? password.indexOf(parts[2]) : +parts[2];
					let b = (isNaN(parts[5])) ? password.indexOf(parts[5]) : +parts[5];
					swap(a, b, password);
				} break;
				
				case 'rotate': {
					switch (parts[1]) {
						case 'right': {
							let steps = +parts[2];
							for (let i = 0; i < steps; ++i)
								password.push(password.shift());
						} break;
						
						case 'left': {
							let steps = +parts[2];
							for (let i = 0; i < steps; ++i)
								password.unshift(password.pop());
						} break;
						
						default: {
							let index = password.indexOf(parts[6]);
							let steps = Math.floor(index >> 1) + (1 - (index % 2)) * (8 - 4 * Math.sign(index)) + 1;
							for (let i = 0; i < steps; ++i)
								password.push(password.shift());
						} break;
					}
				} break;
				
				case 'reverse': {
					let a = +parts[2];
					let b = +parts[4];
					let half = Math.ceil((b - a) / 2);
					for (let i = 0; i < half; ++i)
						swap(a + i, b - i, password);
				} break;
				
				case 'move': {
					password.splice(+parts[2], 0, password.splice(+parts[5], 1)[0]);
				} break;
			}
		});
		
		return password.join('');
	};
	
	result[0] = scramble('abcdefgh');
	result[1] = unscramble('fbgdceah');
	
	callback(result);
});