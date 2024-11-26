console.log('worker created!');

addEventListener('message', async (e) => {
	const { fileName, input } = e.data;

	// console.log(`Running against input "${input}"`);

	const { solution } = await import(`${fileName}?q=${Date.now()}`);

	const answer = solution(input);
	postMessage(answer);
});
