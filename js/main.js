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
	colDiv.appendChild(iframe);
	
	this.colDiv = colDiv;
	this.iframe = iframe;
	
	this.addToDOM();
}

SolutionFrame.prototype.addToDOM = function() {
	document.getElementById('day-container').appendChild(this.colDiv);
	// TODO(bret): Some sort of loading animation and transition
}

Solution = function(id, div) {
	var h2 = document.createElement('h2');
	h2.innerHTML = '<a target="_blank" href="day' + id + '">Day ' + id + '</a>';
	
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