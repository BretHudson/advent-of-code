import { config } from './server.config.js';

addEventListener('message', async (e) => {
	const { year, fileName, input } = e.data;

	const process = config.process(year);

	// console.log(`Running against input "${input}"`);
	try {
		const fileNameUnique = `/${fileName}?q=${Date.now()}`;
		if (!process) {
			const { solution } = await import(fileNameUnique);
			const answers = solution(input);
			postMessage({ success: true, answers });
			return;
		}

		process(input, fileNameUnique, (success, answers) => {
			postMessage({ success, answers });
		});
	} catch (e) {
		console.error(e);
		postMessage({ success: false });
	}
});
