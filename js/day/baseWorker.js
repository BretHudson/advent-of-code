let onmessagefunc = (day, subtitle, func) => {
	return (e) => {
		switch (e.data.msg) {
			case 'info': {
				postMessage({
					msg: 'info',
					info: {
						day: day,
						subtitle: subtitle
					}
				});
			} break;
			
			case 'execute': {
				let result = func(e.data.input, (result) => {
					postMessage({
						msg: 'result',
						result: result,
						finished: true
					});
				});
			} break;
		}
	};
};