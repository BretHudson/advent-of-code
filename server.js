import fs from 'fs';
import path from 'path';
import launch from 'launch-editor';
import { WebSocketServer } from 'ws';
import { config } from './server.config.js';

const { cacheDir, getFileName, getTemplateFileName } = config;

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

const getInput = async (year, day) => {
	const inputDir = path.join(cacheDir, year.toString(), day.toString());
	await createDir(inputDir);

	const inputPath = path.join(inputDir, 'input.txt');

	try {
		return await fs.promises.readFile(inputPath, 'utf8');
	} catch (e) {
		const inputUrl = `https://adventofcode.com/${year}/day/${day}/input`;
		console.log(`Fetching input from ${inputUrl}`);
		const inputRaw = await fetch(inputUrl, {
			method: 'GET',
			headers: {
				Cookie: `session=${SESSION_COOKIE}`,
			},
		}).then((res) => res.text());

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

// TODO: delisten to file!

wss.on('connection', (ws) => {
	console.warn('we have connection');

	ws.on('error', console.error);

	ws.on('message', async (buffer) => {
		const { event, day, year } = JSON.parse(buffer.toString());

		console.log(`Received: ${event}`);

		switch (event) {
			case 'get-input':
				const input = await getInput(year, day);

				ws.send(JSON.stringify({ event: 'get-input', input }));
				break;

			case 'set-day': {
				// TODO: create some sort of replacement thing
				const fileName = getFileName(year, day);

				if (fileName === null) {
					// TODO: handle this case!
					break;
				}

				await listenToFile(ws, fileName, year);
				break;
			}

			case 'open-source': {
				openEditor(getFileName(year, day));
				break;
			}

			default:
				console.error(`"${event}" is not a valid event`);
		}
	});
});

console.log('we are going!!');
