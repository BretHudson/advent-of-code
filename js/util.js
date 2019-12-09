const parseEventMessage = e => {
	const input = e.data.input;
	const result = [null, null];
	const sendResult = () => {
		postMessage({
			result
		})
	};
	
	return {
		input,
		result,
		sendResult
	};
};
