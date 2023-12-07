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

const _permutations = xs => {
    return xs.reduceRight((a, i) => {
    	return a.flatMap(xs => {
    		return [...Array(xs.length + 1).keys()]
                .map(n => xs.slice(0, n).concat(i, xs.slice(n)));
        });
    }, [[]]);
};

Array.prototype.permutations = function() {
	return _permutations(this);
};

const _combinations = (k, xs, prefix = []) => {
	if (prefix.length === 0) xs = [...xs.keys()];
	if (k === 0) return [prefix];
	return xs.flatMap((v, i) => _combinations(k - 1, xs.slice(i + 1), [...prefix, v]));
};

Array.prototype.combinations = function(n) {
	if (n === undefined) return this.slice();
	return _combinations(n, [...this]).map(arr => arr.map(i => this[i]));
};
