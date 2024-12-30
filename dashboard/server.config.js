export const config = {
	cacheDir: '.cache',
	getFileName: (year, day) => {
		const day2 = day.toString().padStart(2, '0');
		switch (year) {
			case 2015:
				return null;
			case 2016:
			case 2017:
			case 2018:
			case 2019:
			case 2020:
			case 2021:
				return `./${year}/js/day/${day}.js`;
			case 2022:
			case 2023:
				return `./${year}/solutions/day-${day}.js`;
			default:
				return `./${year}/solutions/day-${day2}/index.js`;
		}
	},
	getTemplateFileName: (year) => {
		switch (year) {
			case 2015:
				return null;
			case 2016:
			case 2017:
			case 2018:
			case 2019:
			case 2020:
			case 2021:
				return `./${year}/js/day/0.js`;
			case 2022:
			case 2023:
				return `./${year}/solutions/day-0.js`;
			default:
				return `./${year}/solutions/_template.js`;
		}
	},
	process: (year) => {
		switch (year) {
			case 2016:
			case 2017:
				return (input, fileName, callback) => {
					const worker = new Worker(fileName);
					worker.onmessage = (e) => {
						callback(true, e.data.result);
					};
					worker.postMessage({
						msg: 'execute',
						input: input,
					});
				};
			case 2018:
				return (input, fileName, callback) => {
					const worker = new Worker(fileName);
					worker.onmessage = (msg) => {
						const { data } = msg;
						switch (data.msg) {
							case 'result':
								callback(data.finished, data.result);
								break;
						}
					};
					worker.postMessage({ msg: 'init' });
					worker.postMessage({
						msg: 'execute',
						input: input,
					});
				};
			case 2019:
			case 2020:
			case 2021:
				return (input, fileName, callback) => {
					const worker = new Worker(fileName);
					worker.onmessage = (e) => {
						callback(true, e.data.result);
					};
					worker.postMessage({
						input,
					});
				};
		}
	},
};
