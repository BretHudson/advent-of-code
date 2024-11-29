console.log('worker created!');

addEventListener('message', async (e) => {
	const { fileName, input } = e.data;

	// console.log(`Running against input "${input}"`);

	const { solution } = await import(`/${fileName}?q=${Date.now()}`);

	try {
		const answers = solution(input);
		postMessage({ success: true, answers });
	} catch (e) {
		console.error(e);
		postMessage({ success: false });
	}
});
