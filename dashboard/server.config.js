export const config = {
	cacheDir: '.cache',
	runServerSide: true,
	getFileName: (year, day) => {
		const day2 = day.toString().padStart(2, '0');
		switch (year) {
			case 2015:
				return `./2015/day${day}.html`;
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
			case 2015:
				return async (input, fileName, callback) => {
					fetch(fileName)
						.then((res) => res.text())
						.then(async (res) => {
							const xxx = await fetch(
								'/2015/libraries/md5.js',
							).then((res) => res.text());

							const _answers = [null, null];

							let answerTimeout = false;

							const answers = new Proxy(_answers, {
								set: (obj, prop, value) => {
									obj[prop] = value ?? '-';

									if (!answerTimeout && value === '') {
										answerTimeout = -1;
									}
									if (answerTimeout) {
										clearTimeout(answerTimeout);
										answerTimeout = setTimeout(() => {
											callback(true, [...answers]);
										}, 5);
									}

									return true;
								},
							});

							const js =
								xxx +
								';' +
								res
									.split('<script type="text/javascript">')[1]
									.split('</script>')[0]
									.replaceAll(
										`document.getElementById('puzzle-input').value`,
										JSON.stringify(input),
									)
									.replaceAll(
										`document.getElementById('output1').value`,
										'answers[0]',
									)
									.replaceAll(
										`document.getElementById('output2').value`,
										'answers[1]',
									)
									.replaceAll(
										`document.getElementById(output).value`,
										`answers[+(output === 'output2')]`,
									) +
								'generateOutput()';

							eval(js);

							if (!answerTimeout) callback(true, [...answers]);
						});
				};
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
