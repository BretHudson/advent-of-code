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
				let result = func(e.data.input);
				postMessage({
					msg: 'result',
					result: result
				});
			} break;
		}
	};
};