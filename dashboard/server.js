import fs from 'node:fs';
import path from 'node:path';
import child_process from 'node:child_process';
import launch from 'launch-editor';
import { WebSocketServer } from 'ws';
import { config } from './server.config.js';

const { cacheDir, getFileName, getTemplateFileName, runServerSide } = config;

const { SESSION_COOKIE } = process.env;

const openEditor = (fileName, lineNumber = 1) => {
	launch(`${fileName}:${lineNumber}`, 'code', (fileName, error) => {
		console.log(`Could not open ${fileName}`);
		console.error(error);
	});
};

// TODO: make sure we check if a session cookie is set

const createDir = async (dir) => {
	if (!fs.existsSync(dir)) {
		await fs.promises.mkdir(dir, { recursive: true });
	}
};

await createDir(cacheDir);

const sendFetch = async (url, method = 'GET', body, _headers = {}) => {
	const headers = {
		Cookie: `session=${SESSION_COOKIE}`,
		..._headers,
	};
	return fetch(url, {
		method,
		body,
		headers,
	}).then((res) => res.text());
};

const getDescription = async (year, day, invalidateCache = false) => {
	const dayCacheDir = path.join(cacheDir, year.toString(), day.toString());
	await createDir(dayCacheDir);

	const descriptionOnlyPath = path.join(dayCacheDir, 'main.html');

	try {
		if (invalidateCache) throw new Error('cache is empty, weird');
		return await fs.promises.readFile(descriptionOnlyPath, 'utf8');
	} catch (e) {
		const url = `https://adventofcode.com/${year}/day/${day}`;
		console.log(`Fetching html from ${url}`);
		const html = await sendFetch(url);

		const description = html.split('<main>')[1]?.split('</main>')[0];
		if (!description) return null;

		const fullPagePath = path.join(dayCacheDir, 'index.html');
		await fs.promises.writeFile(fullPagePath, html, 'utf8');
		await fs.promises.writeFile(descriptionOnlyPath, description, 'utf8');

		return description;
	}
};

const getInput = async (year, day) => {
	const dayCacheDir = path.join(cacheDir, year.toString(), day.toString());
	await createDir(dayCacheDir);

	const inputPath = path.join(dayCacheDir, 'input.txt');

	try {
		return await fs.promises.readFile(inputPath, 'utf8');
	} catch (e) {
		const inputUrl = `https://adventofcode.com/${year}/day/${day}/input`;
		console.log(`Fetching input from ${inputUrl}`);
		const inputRaw = await sendFetch(inputUrl);

		const input = inputRaw.replace(/\n$/g, '');

		await fs.promises.writeFile(inputPath, input, 'utf8');

		return input;
	}
};

const wss = new WebSocketServer({
	port: 8080,
});

let watcher = null;
let lastFileName;
const listenToFile = async (ws, fileName, year) => {
	if (watcher) {
		console.log(`No longer listening to ${lastFileName}`);
		watcher.close();
	}

	console.log(`Now listening to ${fileName}`);
	lastFileName = fileName;

	if (!fs.existsSync(fileName)) {
		console.error(`${fileName} does not exist`);

		const templateFileName = getTemplateFileName(year);
		if (templateFileName === null) throw new Error('uh oh');

		createDir(path.dirname(fileName));

		const template = await fs.promises.readFile(templateFileName, 'utf8');
		await fs.promises.writeFile(fileName, template, 'utf8');
	}

	let timeout;
	watcher = fs.watch(fileName, (event, fileName) => {
		if (!fileName) return;

		if (timeout) return;
		timeout = setTimeout(() => {
			timeout = undefined;
		}, 100);

		ws.send(JSON.stringify({ event: 'file-update' }));
	});
};

wss.on('connection', (ws) => {
	console.warn('we have connection');

	ws.on('error', console.error);

	ws.on('message', async (buffer) => {
		const { event, day, year, ...data } = JSON.parse(buffer.toString());

		console.log(`Received: ${event}`);

		switch (event) {
			case 'get-description': {
				const description = await getDescription(year, day, true);

				ws.send(
					JSON.stringify({
						event: 'get-description',
						description,
					}),
				);
				break;
			}

			case 'submit-answer': {
				const description = await getDescription(year, day);
				const levelRegex =
					/<input type="hidden" name="level" value="(?<level>\d)">/;

				const level = levelRegex.exec(description)?.groups?.level;
				if (level === undefined) return;

				const { answer } = data;
				const url = `https://adventofcode.com/${year}/day/${day}/answer`;

				const body = `level=${level}&answer=${answer}`;
				const res = await sendFetch(url, 'POST', body, {
					'Content-Type': 'application/x-www-form-urlencoded',
				});
				// TODO: handle res
				// TODO: getDescription(true) if successful!
				console.log(res);
				break;
			}

			case 'get-input': {
				const input = await getInput(year, day);

				ws.send(JSON.stringify({ event: 'get-input', input }));
				break;
			}

			case 'set-day': {
				// TODO: create some sort of replacement thing
				const fileName = getFileName(year, day);

				if (fileName === null) {
					// TODO: handle this case!
					break;
				}

				await listenToFile(ws, fileName, year);

				const description = await getDescription(year, day);
				const input = await getInput(year, day);

				console.log('sending day-changed');
				ws.send(
					JSON.stringify({
						event: 'day-changed',
						fileName,
						description,
						input,
					}),
				);
				break;
			}

			case 'open-source': {
				openEditor(getFileName(year, day));
				break;
			}

			case 'execute': {
				const { input } = data;

				const useGo = true;
				if (useGo) {
					const goDir = 'C:\\Projects\\Go\\aoc-2024-golang';
					child_process.exec(
						path.join(goDir, 'run.bat'),
						(err, stdout, stderr) => {
							if (err) {
								console.error(err);
								return;
							}
							console.log(stdout);
							const answers = [null, null];
							const regex = /Part (\d): (.+)/g;
							let matches;
							while ((matches = regex.exec(stdout))) {
								console.log(matches);
								const [_, index, answer] = matches;
								answers[+index - 1] = Number.isNaN(answer)
									? answer
									: +answer;
							}
							console.log(answers);
							const duration = -1;
							ws.send(
								JSON.stringify({
									event: 'answers',
									success: true,
									answers,
									duration,
								}),
							);
						},
					);
					const child = child_process.spawn(`cd ${goDir}`, {
						shell: true,
					});
					child.stdout.on('data', (data) => {
						console.log(`stdout: ${data}`);
					});

					child.stderr.on('data', (data) => {
						console.error(`stderr: ${data}`);
					});

					child.on('close', (code) => {
						console.log(`child process exited with code ${code}`);
					});
				} else {
					const filePath = `.${getFileName(
						year,
						day,
					)}?${Date.now().toString(36)}`;

					const { solution } = await import(filePath);
					const start = performance.now();
					const answers = solution(input);
					const duration = performance.now() - start;
					ws.send(
						JSON.stringify({
							event: 'answers',
							success: true,
							answers,
							duration,
						}),
					);
				}
				break;
			}

			default:
				console.error(`"${event}" is not a valid event`);
		}
	});
});

console.log('we are going!!');
