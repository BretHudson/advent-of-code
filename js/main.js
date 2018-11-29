const irandom = (n) => Math.floor(Math.random() * n);
const choose = (...args) => args[irandom(args.length)];

let daysCompleted = 2;
let worker = null;
let openWorker = (id, input) => {
	closeWorker();
	worker = new Worker('./js/day/' + id + '.js');
	worker.onmessage = (e) => {
		showResults(e.data.result);
		if (e.data.finished) {
			closeWorker();
			finishAnim();
		}
	};
	worker.postMessage({
		msg: 'execute',
		input: input
	});
};

let closeWorker = () => {
	if (worker !== null) {
		worker.terminate();
		worker = null;
	}
};

let snowflakes = [];
let numSnowflakes = 0;
let snowflakesElem;
let addSnowflake = (x, y) => {
	let size = (Math.random() * 0.5) + 0.75;
	let element = $new('.snowflake').element();
	element.style.width = size + 'em';
	element.style.height = size + 'em';
	snowflakesElem.append(element);
	let snowflake = {
		element: element,
		x: (x + (Math.random() * 7) - 3.5),
		y: (y + (Math.random() * 7) - 3.5),
		t: ((size - 0.75) * 0.8) + 0.7
	};
	snowflakes.push(snowflake);
	++numSnowflakes;
};

let wrap = true;
let lastElapsed = 0;
let snowflakeScale;
let animateSnowflakes = (elapsed) => {
	window.requestAnimationFrame(animateSnowflakes);
	let snowflake;
	let animating = wrap;
	for (let s = 0; s < numSnowflakes; ++s) {
		snowflake = snowflakes[s];
		snowflake.y += (elapsed - lastElapsed) * 0.012 * snowflake.t;
		if (wrap === true) {
			while (snowflake.y >= 50)
				snowflake.y -= 100;
		} else {
			if (snowflake.y < 50)
				animating = true;
		}
		let scaleX = (snowflake.y + 10) * 0.013;
		scaleX = 0.96 - (scaleX * scaleX);
		snowflake.element.style.left = snowflake.x * snowflakeScale * scaleX + 'px';
		snowflake.element.style.top = snowflake.y * snowflakeScale + 'px';
	}
	lastElapsed = elapsed;
	if (animating === false) {
		snowflakesElem.removeClass('animate');
	}
};

let showResults = (results) => {
	results = results || [ 'Please wait...', 'Results are loading...' ];
	document.q('#result-1').value = results[0];
	document.q('#result-2').value = results[1];
};

let finishAnim = () => {
	document.q('#shake-button').disabled = wrap = false;
};

let changeDay = (day) => {
	let href = 'https://github.com/BretHudson/AdventOfCode2017/blob/master/js/day/' + day + '.js';
	let anchor = document.q('#source a');
	anchor.textContent = 'View Day ' + day + ' Source';
	anchor.setAttribute('href', href);
	showResults([ '', '' ]);
};

document.on('DOMContentLoaded', (e) => {
	// Year stuff
	let yearsStr = '';
	let maxYear = (new Date(Date.now() + 30 * 8.64e7)).getFullYear() - 1;
	for (var year = 2015; year <= maxYear; ++year) {
		if (year === 2017) continue;
		yearsStr += '<a href="https://brethudson.github.io/AdventOfCode' + year + '/">' + year + '</a> - ';
	}
	document.q('#years').innerHTML = yearsStr.substring(0, yearsStr.length - 3);
	
	// Generate snowflakes
	snowflakesElem = document.q('#snowflakes')
	let dist = 6;
	let inc = dist * 2;
	let limit = dist;
	while (limit + dist <= 50)
		limit += dist;
	let iter = 0;
	for (let y = -limit; y < limit; y += inc, ++iter) {
		for (let x = -45; x < 45; x += inc) {
			if (iter % 2 === 1)
				addSnowflake(x * -1, y);
			else
				addSnowflake(x, y);
		}
	}
	
	let resize = () => {
		let width, height;
		let ratio = window.innerWidth / window.innerHeight;
		if (ratio > 1.05) {
			document.body.addClass('landscape');
			document.body.removeClass('portrait');
			width = window.innerWidth / 142;
			height = window.innerHeight / 65;
		} else {
			document.body.addClass('portrait');
			document.body.removeClass('landscape');
			width = window.innerWidth / 75;
			height = window.innerHeight / 115;
		}
		
		let size = Math.min(width, height);
		if (size === width) {
			document.body.addClass('width');
			document.body.removeClass('height');
		} else {
			document.body.addClass('height');
			document.body.removeClass('width');
		}
		
		document.body.style.fontSize = `${size}px`;
		let globe = document.q('#snowglobe');
		snowflakeScale = 0.01 * globe.getBoundingClientRect().width;
	};
	
	window.on('resize', resize);
	resize();
	
	let daySelect = document.q('#day-select');
	for (let day = 1; day <= daysCompleted; ++day) {
		daySelect.append($new('option.day').text('Day ' + day).attr('value', day));
	}
	daySelect.on('change', e => {
		changeDay(e.target.value);
	});
	changeDay(1);
	
	document.q('#shake-button').on('click', e => {
		e.target.disabled = wrap = true;
		window.requestAnimationFrame(() => {
			snowflakesElem.addClass('animate');
		});
		showResults();
		openWorker(daySelect.value, document.q('#input').value);
	});
	
	window.requestAnimationFrame(animateSnowflakes);
});