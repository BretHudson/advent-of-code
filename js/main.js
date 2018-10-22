function addMetaTags(day) {
	var head = document.head;
	
	var baseURL = window.location.origin + '/AdventOfCode2015/';
	
	var description = 'JavaScript Solutions for Advent of Code 2015';
	var siteName = 'Bret Hudson\'s Advent of Code 2015';
	var title = siteName;
	var url = baseURL;
	if (day !== undefined) {
		description = 'Advent of Code 2015 Day ' + day + ' solution (JavaScript)';
		title = 'Day ' + day + ' - ' + title;
		url += 'day' + day;
	}
	
	var properties = {
		description: description,
		image: baseURL + 'img/preview.png',
		site_name: siteName,
		title: title,
		type: 'website',
		url: url
	};
	
	var elem;
	for (var key in properties) {
		elem = document.createElement('meta');
		elem.setAttribute('property', key);
		elem.setAttribute('content', properties[key]);
		head.appendChild(elem);
	}
}

SolutionFrame = function(id) {
	this.id = id;
	
	var iframe = document.createElement('iframe');
	iframe.id = 'day-' + this.id;
	iframe.width = '100%';
	iframe.src = 'day' + this.id + '';
	iframe.onload = function(e) {
		var iframe = e.path[0];
		iframe.height = 60 + iframe.contentWindow.document.body.scrollHeight;
	};
	
	var colDiv = document.createElement('div');
	colDiv.className = 'day col-md-6 col-lg-4';
	if (id === 25)
		colDiv.className = 'day col-md-6 col-md-push-3 col-lg-4 col-lg-push-4';
	colDiv.appendChild(iframe);
	
	this.colDiv = colDiv;
	this.iframe = iframe;
	this.iframe.day = id;
	
	this.addToDOM();
}

SolutionFrame.prototype.addToDOM = function() {
	document.getElementById('day-container').appendChild(this.colDiv);
	// TODO(bret): Some sort of loading animation and transition
}

Solution = function(id, div) {
	addMetaTags(id);
	
	var h2 = document.createElement('h2');
	h2.innerHTML = '<a target="_parent" id="link-day-' + id + '" href="day' + id + '">Day ' + id + '</a>';
	
	var source = document.createElement('a');
	source.innerText = 'View Source';
	source.href = 'https://github.com/BretHudson/AdventOfCode2015/blob/master/day' + id + '.html';
	source.target = '_BLANK';
	
	var h4 = document.createElement('h4');
	h4.appendChild(source);
	
	this.div = document.getElementById(div);
	this.div.parentNode.insertBefore(h2, this.div);
	this.div.parentNode.appendChild(h4);
}