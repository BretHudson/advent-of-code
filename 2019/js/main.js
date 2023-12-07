const IS_TOUCH_DEVICE = !!(
	'ontouchstart' in window ||
	(window.DocumentTouch && document instanceof DocumentTouch)
);

const daysCompleted = 8;

const minYear = 2015;
const maxYear = new Date(Date.now() + 30 * 8.64e7).getFullYear() - 1;

const computeNaughtyScore = (name) => {
	return (
		12 -
		((name
			.toUpperCase()
			.replace(/\s/g, '')
			.split('')
			.reduce((acc, l) => (acc = (acc + l.charCodeAt(0)) % 64), 0) *
			487) %
			13)
	);
};

const startWork = (id) => {
	resultElems.forEach((e) => {
		e.classList.remove('finished');
	});

	let text = 'View Source';
	let href = 'https://github.com/BretHudson/advent-of-code';
	if (id !== null) {
		text = `View Day ${id} Source`;
		href += `/blob/main/2019/js/day/${id}.js`;
	}

	const sourceElem = document.querySelector('#source');
	sourceElem.textContent = text;
	sourceElem.href = href;

	return {
		input: document.querySelector('[name=input]').value,
	};
};

const naughtyornice = () => {
	const { input } = startWork(null);

	const result = [null, null];
	if (input) {
		const score = computeNaughtyScore(input);
		const naughty = score % 2 === 0;
		const itemType = naughty ? 'pieces of coal' : 'presents';

		result[0] = naughty ? 'Naughty' : 'Nice';
		result[1] = `${score + 1} ${itemType}`;

		setTimeout(() => handleResult(result), 1e3 * 0.3);
	}
};

let worker = null;
const execWorker = (id) => {
	const { input } = startWork(id);

	if (worker !== null) worker.terminate();

	worker = new Worker(`./js/day/${id}.js`);
	worker.onmessage = (e) => {
		handleResult(e.data.result);
	};
	worker.postMessage({
		input,
	});
};

const handleResult = (result) => {
	resultElems.forEach((e, i) => {
		e.value = result[i];
		e.parentElement.dataset.value = result[i];
		e.classList.add('finished');
	});
};

const resultElems = [null, null];
window.on('DOMContentLoaded', (e) => {
	const body = document.body;

	const header = $new('header');
	header.children(
		$new('h2')
			.child(
				$new('a')
					.attr('href', 'https://brethudson.com')
					.text('Bret Hudson'),
			)
			.text(' Presents'),
		$new('h1').text('Advent of Code 2019'),
		$new('hr'),
	);

	const buttons = $new('.buttons');
	const addButton = (title, onclick) => {
		const button = $new('.button').text(title).on('click', onclick);
		buttons.child(button);
	};

	addButton('Naughty or Nice', naughtyornice);

	for (let i = 1; i <= daysCompleted; ++i) addButton(i, (e) => execWorker(i));

	const results = $new('.results').children(
		$new('label').text('Result 1'),
		$new('.result').child($new('textarea[name=result1]').attr('rows', 1)),
		$new('label').text('Result 2'),
		$new('.result').child($new('textarea[name=result2]').attr('rows', 1)),
		$new('a#source')
			.attr(
				'href',
				'https://github.com/BretHudson/advent-of-code/tree/main/2019',
			)
			.attr('target', '_blank')
			.text('View Source'),
	);

	const main = $new('main');
	main.children(
		$new('.title').text("Santa's List"),
		$new('textarea')
			.attr('name', 'input')
			.attr('placeholder', 'Please insert your name (or an input)'),
		buttons,
		results,
	);

	const footer = $new('footer');
	const addToFooter = (link, title) => {
		footer.child(
			$new('span').child($new('a').attr('href', link).text(title)),
		);
	};

	addToFooter(
		'https://github.com/BretHudson/advent-of-code/tree/main/2019',
		'View Source',
	);
	for (let year = 2015; year <= maxYear; ++year) {
		if (year === 2019) continue;
		addToFooter(`../${year}/`, year);
	}

	body.append(header);
	body.append(main);
	body.append(footer);

	resultElems[0] = document.querySelector('[name=result1]');
	resultElems[1] = document.querySelector('[name=result2]');
});
