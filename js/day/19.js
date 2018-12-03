importScripts('baseWorker.js');
onmessage = onmessagefunc(19, 'An Elephant Named Joseph', (input, callback) => {
	let result = [ null, null ];
	
	let j = n => (n - Math.pow(2, Math.floor(Math.log2(n)))) * 2 + 1;
	let k = n => {
		let cycle = Math.floor(Math.log(n - 1) / Math.log(3));
		let offset = Math.pow(3, cycle);
		let diff = n - offset;
		return (diff > offset) ? ((diff - offset) * 2 + offset) : diff;
	};
	result[0] = j(+input);
	result[1] = k(+input);
	
	callback(result);
});

/*
	First pass before giving it the ol' math 1-2
	let takeTurnsV1 = () => {
		let elves = (new Array(+input)).fill(1);
		let cur = 0, next = 0;
		let iter = 0;
		for (;;) {
			if (elves[cur] > 0) {
				do {
					next = (next + 1) % total;
					if (elves[next] > 0)
						break;
				} while (next !== cur);
				if (next === cur) break;
				elves[cur] += elves[next];
				elves[next] = 0;
			} else
				next = (cur + 1) % total;
			if (elves[cur] === total) break;
			cur = next;
		}
		return cur + 1;
	};
	
	let takeTurnsV2 = () => {
		let elves = new Array(27).fill(0);
		elves = elves.map((val, index) => { return { id: index + 1, presents: 1 }; });
		let numInCircle = elves.length;
		for (let e = 0; e < numInCircle; ++e) {
			elves[e].prev = elves[(numInCircle + e - 1) % numInCircle];
			elves[e].next = elves[(numInCircle + e + 1) % numInCircle];
		}
		
		let curElf = elves[0];
		let acrossElfIndex;
		while (numInCircle > 1) {
			acrossElf = curElf;
			for (let i = 0, n = numInCircle >> 1; i < n; ++i)
				acrossElf = acrossElf.next;
			acrossElf.prev.next = acrossElf.next;
			acrossElf.next.prev = acrossElf.prev;
			
			curElf.presents += acrossElf.presents;
			acrossElf.presents = 0;
			
			curElf = curElf.next;
			--numInCircle;
			if (numInCircle % 100 === 0)
				console.log(numInCircle);
		}
		
		return curElf.id;
	};
*/