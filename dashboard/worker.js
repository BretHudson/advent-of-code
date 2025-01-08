import { config } from './server.config.js';

addEventListener('message', async (e) => {
	const { year, fileName, input } = e.data;

	const process = config.process(year);

	// console.log(`Running against input "${input}"`);
	let start = performance.now();
	try {
		const fileNameUnique = `/${fileName}?${Date.now().toString(36)}`;
		if (!process) {
			const { solution } = await import(fileNameUnique);
			const answers = solution(input);
			postMessage({
				success: true,
				answers,
				duration: performance.now() - start,
			});
			return;
		}

		process(input, fileNameUnique, (success, answers) => {
			postMessage({
				success,
				answers,
				duration: performance.now() - start,
			});
		});
	} catch (e) {
		console.error(e);
		postMessage({ success: false, duration: performance.now() - start });
	}
});
