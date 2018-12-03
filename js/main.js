const NUM_DAYS = 21;

Math.clamp = (val, min, max) => {
	return Math.min(Math.max(val, min), max);
};

class Random {
	constructor(seed) {
		this.m = 0x80000000 - 1;
		this.a = 16807;
		this.c = 0;
		
		this.seed = seed;
		this.state = seed;
	}
	
	next() {
		this.state = (this.a * this.state + this.c) % this.m;
		return this.state;
	}
}

let rng = new Random(276392);

const STATE = {
	BROWSE: 'BROWSE',
	SVG: 'SVG',
	LETTER: 'LETTER'
};

let curState = STATE.BROWSE;
let letter, overlay, dayHolder;

let letterTransformPos = 0;
let transformPositions = [ -50 / 3, -150 / 3, -250 / 3 ];
let isScrolling = false;

let curDay = null;
let stamps = [ '.green', '.red', '.blue', '.yellow', '.orange ' ];

let getStamp = (day) => {
	let n = rng.next() % stamps.length;
	return stamps[n];
};

let worker = null;
let curDayInfo = {
	day: 0,
	subtitle: 'null title'
};

let openWorker = (id) => {
	closeWorker();
	worker = new Worker('./js/day/' + id + '.js');
	worker.postMessage({ msg: 'info' });
	worker.onmessage = (e) => {
		switch (e.data.msg) {
			case 'info': {
				curDayInfo = e.data.info;
			} break;
			
			case 'result': {
				let result = e.data.result;
				document.getElementById('result-1').value = result[0];
				document.getElementById('result-2').value = result[1];
				if (e.data.finished)
					playLoading(false);
			} break;
		};
	};
};

let closeWorker = () => {
	if (worker !== null) {
		worker.terminate();
		worker = null;
	}
};

let playLoading = (play) => {
	let elem = document.querySelector('.loading-anim');
	elem.className = elem.className.replace(' play', '');
	if (play)
		elem.className += ' play';
};

let sendInput = () => {
	let input = document.getElementById('puzzle-input');
	worker.postMessage({
		msg: 'execute',
		input: input.value
	});
	playLoading(true);
	scrollLetter(1);
};

let setOverlay = (setting) => {
	overlay.className = setting;
};

let resizeLetter = () => {
	let height = window.innerHeight;
	let maxWidth = window.innerWidth;
	let width = Math.min(maxWidth, height / (250 / 350));
	
	let fontSize = (Math.min(width, 900) / 900) * 3.75;
	
	window.requestAnimationFrame(() => {
		letter.style.width = width + 'px';
		letter.style.fontSize = fontSize + 'rem';
	});
};

let openLetter = (id, saveToHistory) => {
	openWorker(id);
	
	if (saveToHistory === undefined)
		saveToHistory = true;
	
	if (saveToHistory)
		history.pushState({}, 'Day ' + id, '#day' + id);
	
	if (curState === STATE.BROWSE)
		curState = STATE.SVG;
	else {
		console.warn('curState is ', curState, ' which is not STATE.BROWSE');
		return;
	}
	
	setOverlay('show');
	resetLetterTransform();
	
	let elem = document.getElementById('envelope-wrapper');
	elem.className = 'open';
	setTimeout(() => {
		elem.className += ' flap-open';
	}, 600);
	setTimeout(() => {
		elem.className = '';
		showLetter();
	}, 3000);
};

let setLetterTransform = (val) => {
	window.requestAnimationFrame(() => {
		val = val || transformPositions[letterTransformPos];
		letter.style.transform = 'translate(-50%, ' + val + '%)';
	});
};

let resetLetterTransform = () => {
	letter.className = '';
	letterTransformPos = 0;
	scrollLetter(0);
};

let scrollLetter = (dir) => {
	if (isScrolling) return;
	
	let newPos = Math.clamp(letterTransformPos + dir, 0, 2);
	
	if (letterTransformPos === newPos) return;
	letterTransformPos = newPos;
	
	isScrolling = true;
	setTimeout(() => { isScrolling = false; }, 500);
	
	setLetterTransform();
};

let showLetter = () => {
	curState = STATE.LETTER;
	
	let curDay = curDayInfo.day;
	
	let subtitle = curDayInfo.subtitle;
	let sourceURL = 'https://github.com/BretHudson/AdventOfCode2016/blob/master/js/day/' + curDay + '.js';
	
	letter.querySelector('.title').dataset.day = curDay;
	letter.querySelector('.subtitle').dataset.subtitle = subtitle;
	letter.querySelector('.view-source').href = sourceURL;
	
	letterTransformPos = 0;
	setLetterTransform();
	
	playLoading(false);
	
	letter.className = 'show';
};

let close = () => {
	closeWorker();
	
	setOverlay('');
	
	letter.querySelector('#puzzle-input').value = '';
	letter.querySelector('#result-1').value = '';
	letter.querySelector('#result-2').value = '';
	
	letter.className = '';
	curState = STATE.BROWSE;
	curDay = null;
};

let placeHeaders = () => {
	window.requestAnimationFrame(() => {
		let h1 = document.querySelector('h1');
		let h2 = document.querySelector('h2');
		
		let rect = document.getElementById('day-holder-wrapper').getBoundingClientRect();
		
		let h2Height = h2.getBoundingClientRect().height;
		h2.style.top = rect.top - (h2Height / 2) - 20 + 'px';
		
		let h1Height = h1.getBoundingClientRect().height;
		h1.style.top = rect.bottom + (h1Height / 2) + 30 + 'px';
	});
};

let createDay = (id) => {
	let leading0 = ('0' + id).substr(-2);
	let day =
		$new('.day')
			.attr('data-day', id)
			.on('click', () => {
				openLetter(id);
			})
			.children(
				$new('.card').children(
					$new('.from-text'),
					$new('.to-name-text'),
					$new('.to-address-text'),
					$new('.date-text.pressed')
						.attr('data-date', 'DEC ' + leading0 + ' 2016'),
					$new('.urgent-text.pressed'),
					$new('.css-stamp' + getStamp(id)).children(
						$new('.ridges'),
						$new('.inner-border'),
						$new('.inner-diamond')
					)
				)
			).element();
	let deg = 2 + (rng.next() % 4);
	let dir = (rng.next() % 2) * 2 - 1;
	deg *= dir;
	day.children[0].style.transform = 'rotate(' + deg + 'deg)'
	dayHolder.appendChild(day);
};

let resizeDayHolder = () => {
	let wrapper = document.getElementById('day-holder-wrapper');
	let extraPadding = 10;
	let wrapperHeight = dayHolder.getBoundingClientRect().height + (extraPadding * 2) + 'px';
	let padding = dayHolder.offsetHeight - dayHolder.clientHeight;
	let dayDiv = dayHolder.querySelector('.day');
	let dayDivWidth = dayDiv.getBoundingClientRect().width + 40;
	
	let sidePadding = (wrapper.getBoundingClientRect().width - dayDivWidth) / 2;
	sidePadding = Math.max(sidePadding, dayDivWidth / 2);
	window.requestAnimationFrame(() => {
		wrapper.style.height = wrapperHeight;
		dayHolder.style.paddingTop = (padding / 2) + extraPadding + 'px';
		dayHolder.style.paddingBottom = padding + extraPadding + 'px';
		dayHolder.style.paddingLeft = dayHolder.style.paddingRight = sidePadding + 'px';
	});
};

let handleHash = () => {
	if (window.location.hash !== '') {
		let hash = window.location.hash.replace('#', '').replace('day', '').replace('-', '');
		let day = parseInt(hash, 10);
		if ((day > 0) && (day <= NUM_DAYS)) {
			let timeout = 250;
			if (curState === STATE.LETTER) {
				timeout = 750;
				close();
			}
			window.setTimeout(() => {
				openLetter(day, false);
			}, timeout);
		}
	}
}

document.addEventListener('DOMContentLoaded', (e) => {
	letter = document.getElementById('letter');
	overlay = document.getElementById('overlay');
	dayHolder = document.getElementById("day-holder");
	
	years = document.getElementById('years');
	let yearsStr = '';
	let maxYear = (new Date(Date.now() + 30 * 8.64e7)).getFullYear() - 1;
	for (var year = 2015; year <= maxYear; ++year) {
		if (year === 2016) continue;
		yearsStr += '<a href="https://brethudson.github.io/AdventOfCode' + year + '/">' + year + '</a> - ';
	}
	years.innerHTML = yearsStr.substring(0, yearsStr.length - 3);
	
	overlay.addEventListener('click', (e) => {
		if (curState === STATE.LETTER) {
			close();
		}
	});
	
	for (let d = 1; d <= NUM_DAYS; ++d) {
		createDay(d);
	}
	
	handleHash();
	
	resizeLetter();
	resizeDayHolder();
	placeHeaders();
	
	if (false) {
		setOverlay('show');
		resetLetterTransform();
		openWorker(1);
		window.setTimeout(() => {
			showLetter();
		}, 200);
	}
});

window.addEventListener('hashchange', (e) => {
	handleHash();
});

window.addEventListener('resize', (e) => {
	resizeLetter();
	resizeDayHolder();
	placeHeaders();
});

window.addEventListener('wheel', (e) => {
	let dir = Math.sign(e.deltaY);
	switch (curState) {
		case STATE.BROWSE: {
			dayHolder.scrollBy(dir * 100, 0);
		} break;
		
		case STATE.LETTER: {
			scrollLetter(dir);
		} break;
	}
}, { passive: true });

let touchY = null;
let touchStartY = null;
let touchStartLetterTransform;
window.addEventListener('touchstart', (e) => {
	if (isScrolling === true) return;
	
	switch (curState) {
		case STATE.LETTER: {
			touchY = null;
			touchStartY = null;
			if (e.path[0] !== overlay) {
				touchStartY = e.touches[0].clientY;
				touchStartLetterTransform = transformPositions[letterTransformPos];
				letter.className = 'show touch';
			}
		} break;
	}
});

let computeLetterTransform = () => {
	let result = touchStartLetterTransform;
	let diff = touchY - touchStartY;
	let ratio = 100 * (window.innerHeight / 624);
	result += (ratio * diff / (window.innerHeight));
	return result;
};

window.addEventListener('touchmove', (e) => {
	if (curState === STATE.LETTER)
		e.preventDefault();
	
	if (isScrolling === true) return;
	
	switch (curState) {
		case STATE.LETTER: {
			if (touchStartY !== null) {
				touchY = e.touches[0].clientY;
				let transform = computeLetterTransform();
				setLetterTransform(transform);
			}
		} break;
	}
});

window.addEventListener('touchend', (e) => {
	switch (curState) {
		case STATE.LETTER: {
			if (touchStartY !== null) {
				let transform = computeLetterTransform();
				let distances = transformPositions.map((val, index) => {
					return { id: index, dist: Math.abs(val - transform) };
				});
				
				distances.sort((a, b) => {
					if (a.dist < b.dist) return -1;
					if (a.dist > b.dist) return 1;
					return 0;
				});
				
				letter.className = 'show';
				isScrolling = true;
				
				letterTransformPos = distances[0].id;
				setLetterTransform();
				
				touchStartY = null;
				
				setTimeout(() => { isScrolling = false; }, 500);
			}
		} break;
	}
});

window.addEventListener('keydown', (e) => {
	switch (e.keyCode) {
		case 27: {
			switch (curState) {
				case STATE.LETTER: {
					close();
				} break;
			}
		} break;
	}
});
