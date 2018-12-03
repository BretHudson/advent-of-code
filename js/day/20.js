importScripts('baseWorker.js');
onmessage = onmessagefunc(20, 'Firewall Rules', (input, callback) => {
	let result = [ null, null ];
	
	let addresses = input.split('\n').map(line => line.split('-').map(val => +val));
	addresses.sort((a, b) => Math.sign(a[0] - b[0]));
	
	// Merge IPs
	for (let a = 0; a < addresses.length - 1; ++a) {
		for (; a < addresses.length - 1;) {
			if (addresses[a][1] >= addresses[a + 1][0]) {
				addresses[a][1] = Math.max(addresses[a][1], addresses[a + 1][1]);
				addresses.splice(a + 1, 1);
			} else
				break;
		}
	}
	
	let findLowestUnblockedIP = () => {
		let testIP = 0;
		for (let i = 0, n = addresses.length; i < n; ++i) {
			if (testIP < addresses[i][0])
				return testIP;
			testIP = addresses[i][1] + 1;
		}
	};
	
	let numIPsAllowed = () => {
		let testIP = 0;
		let count = 0;
		for (let i = 0, n = addresses.length; i < n; ++testIP) {
			if (testIP < addresses[i][0])
				++count;
			else
				testIP = addresses[i++][1];
		}
		return count;
	};
	
	result[0] = findLowestUnblockedIP();
	result[1] = numIPsAllowed();
	//result[1] = numIPsAllowed();
	
	callback(result);
});