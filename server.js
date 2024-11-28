import fs from 'fs';
import path from 'path';
import { parse, walk, SyntaxKind } from 'html5parser';
import launch from 'launch-editor';
import { WebSocketServer } from 'ws';
import { config } from './server.config.js';

function extractCodeBlocks(node, inline = false, codeBlocks = []) {
	switch (node.name) {
		case 'p':
		case 'li':
			inline = true;
			break;
		case 'code': {
			const content = node.body
				.map((child) => child.value || '')
				.join('')
				.replace(/\n$/g, '');
			if (content)
				codeBlocks.push({
					content: isNaN(content) ? content : +content,
					inline,
				});
			break;
		}
	}

	for (const child of node.body ?? []) {
		extractCodeBlocks(child, inline, codeBlocks);
	}
	return codeBlocks;
}

function extractAllCodeBlocks(html) {
	const ast = parse(html);
	const blocks = extractCodeBlocks(ast[2]);
	const groupedBlocks = Object.groupBy(blocks, ({ inline }) =>
		inline ? 'inline' : 'standalone',
	);
	return groupedBlocks;
}

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

const sendFetch = async (url, headers = {}) =>
	fetch(url, {
		method: 'GET',
		headers: {
			Cookie: `session=${SESSION_COOKIE}`,
			...headers,
		},
	}).then((res) => res.text());

const getDescription = async (year, day) => {
	const dayCacheDir = path.join(cacheDir, year.toString(), day.toString());
	await createDir(dayCacheDir);

	const htmlPath = path.join(dayCacheDir, 'index.html');

	try {
		return await fs.promises.readFile(htmlPath, 'utf8');
	} catch (e) {
		const url = `https://adventofcode.com/${year}/day/${day}`;
		console.log(`Fetching html from ${url}`);
		const html = await sendFetch(url);

		await fs.promises.writeFile(htmlPath, html, 'utf8');

		return html;
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
			case 'get-description': {
				const description = await getDescription(year, day);

				const blocks = extractAllCodeBlocks(description);

				ws.send(
					JSON.stringify({
						event: 'get-description',
						description,
						blocks,
					}),
				);
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
