export const solution = (input) => {
	const answers = [null, null];

	const lines = input.split('\n').map((line) => {
		const parts = line.split(' ');

		switch (parts[0]) {
			case '$':
				return {
					type: 'command',
					command: parts[1],
					arg: parts[2],
				};
			case 'dir':
				return {
					type: 'dir',
					name: parts[1],
				};
			default:
				return {
					type: 'file',
					size: +parts[0],
					name: parts[1],
				};
		}
	});

	const createDir = (name, parent) => {
		const newDir = {
			name,
			parent,
			type: 'dir',
			totalSize: 0,
			children: [],
		};
		parent?.children.push(newDir);
		return newDir;
	};

	const createFile = (name, size, parent) => {
		const newFile = {
			name,
			parent,
			size,
		};
		parent?.children.push(newFile);
		return newFile;
	};

	let fileSystem;
	let curDir;

	const getDir = (name, curDir) =>
		curDir?.children.find((dir) => dir.name === name) ??
		createDir(name, curDir);

	for (let i = 0, n = lines.length; i < n; ++i) {
		const { command, arg } = lines[i];
		switch (command) {
			case 'cd': {
				if (arg === '..') curDir = curDir.parent;
				else {
					const name = arg;
					curDir = getDir(name, curDir);
					fileSystem ??= curDir;
				}
				break;
			}

			case 'ls': {
				for (
					let line = lines[++i];
					line && line.type !== 'command';
					line = lines[++i]
				) {
					if (line.type === 'dir') {
						createDir(line.name, curDir);
					} else if (line.type === 'file') {
						createFile(line.name, line.size, curDir);
					}
				}
				--i;
				break;
			}
		}
	}

	const dirQueue = [];
	const queue = [fileSystem];
	while (queue.length) {
		const item = queue.shift();

		if (item.children) {
			queue.push(...item.children);
			if (item.parent) dirQueue.push(item);
		} else {
			item.parent.totalSize += item.size;
		}
	}

	const dirs = [fileSystem];
	while (dirQueue.length) {
		const dir = dirQueue.pop();
		dirs.push(dir);
		dir.parent.totalSize += dir.totalSize;
	}

	const small = dirs.filter((dir) => dir.totalSize <= 100000);

	answers[0] = small.reduce((acc, { totalSize }) => acc + totalSize, 0);

	const totalSpace = 70000000;
	const unusedSpace = totalSpace - fileSystem.totalSize;
	const minSpaceDeleted = 30000000 - unusedSpace;

	dirs.sort(({ totalSize: a }, { totalSize: b }) => a - b);

	const toDelete = dirs.find(({ totalSize }) => totalSize >= minSpaceDeleted);

	answers[1] = toDelete.totalSize;

	return answers;
};
