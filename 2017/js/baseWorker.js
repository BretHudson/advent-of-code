let onmessagefunc = (func) => {
	return e => {
		func(e.data.input, (result) => {
			postMessage({
				result: result,
				finished: true
			});
		});
	};
};