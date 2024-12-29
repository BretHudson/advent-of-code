importScripts('./../util.js');

onmessage = (e) => {
	const { input, result, sendResult } = parseEventMessage(e);

	const items = input.split('\n').map((line) => {
		const [ingredients, allergens] = line
			.replace(/[,)]/g, '')
			.split(' (contains ')
			.map((str) => str.split(' ').sort());
		return { raw: line, ingredients, allergens };
	});

	const allAllergens = new Set(items.flatMap(({ allergens }) => allergens));
	const allergenInfoArr = [...allAllergens].map((name) => ({
		name,
		items: [],
	}));

	const allergenInfo = Object.fromEntries(
		allergenInfoArr.map((info) => [info.name, info]),
	);

	items.forEach((item) => {
		item.allergens.forEach((allergen) => {
			const info = allergenInfo[allergen];
			info.items.push(item);
		});
	});

	const intersection = (a1, a2) => a1.filter((v) => a2.includes(v));

	const potentialAllergens = new Set();
	allergenInfoArr.forEach((info) => {
		const lists = info.items.map(({ ingredients }) => ingredients);
		info.candidates = new Set(lists.reduce(intersection));
		info.candidates.forEach((c) => potentialAllergens.add(c));
	});

	const safeIngredients = [];
	items.forEach((item) => {
		item.ingredients.forEach((ingredient) => {
			if (!potentialAllergens.has(ingredient)) {
				safeIngredients.push(ingredient);
			}
		});
	});

	const queue = [...allergenInfoArr];
	const map = {};
	while (queue.length) {
		const cur = queue.shift();
		if (cur.candidates.size > 1) {
			queue.push(cur);
			continue;
		}

		const [item] = [...cur.candidates.values()];
		map[cur.name] = item;
		allergenInfoArr.forEach((info) => info.candidates.delete(item));
	}

	result[0] = safeIngredients.length;
	result[1] = Object.entries(map)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([_, v]) => v)
		.join(',');

	sendResult();
};
