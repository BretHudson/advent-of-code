importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const createBag = (name, contains = []) => ({
		name: name.toCamelCase(),
		contains
	});
	
	const bagNameToId = name => bags.findIndex(bag => bag.name === name);
	const unfold = id => [id, ...(bagTable[id] || []).flatMap(unfold)].filter(filterDuplicates);
	const _howManyBags = (bags) => (acc, val) => acc + howManyBags(bags, val);
	const howManyBags = (bags, val) => bags[val].contains.reduce(_howManyBags(bags), 1);
	
	const bags = input.split('\n')
		.flatMap(bagData => {
			const [bagName, containsStr] = bagData.replace(/bag(s)?/g, () => 'bag').split(' contain ').flatMap(v => v.split('.'));
			
			const contains = containsStr.split(', ').flatMap(bag => {
				const [num, ...nameArr] = bag.split(' ');
				const name = nameArr.join(' ').toCamelCase();
				return Array.from({ length: num }, v => name);
			});
			
			return [
				createBag(bagName, contains),
				...contains.filter((val, i, arr) => arr.indexOf(val) === i).map(n => createBag(n))
			];
		})
		.sort((a, b) => a.name.localeCompare(b.name) || (b.contains.length - a.contains.length))
		.filter((val, i, arr) => arr.findIndex(v => v.name === val.name) === i)
		.map((bag, i, bags) => ({
			...bag,
			contains: bag.contains.map(bag => bags.findIndex(b => b.name === bag))
		}));
	
	const bagTable = bags.reduce((table, bag) => {
		const { name, contains } = bag;
		
		const parentId = bagNameToId(name);
		
		return contains.reduce((table, id) => {
			table[id] = (table[id] || []);
			if (table[id].indexOf(parentId) === -1)
				table[id].push(parentId);
			return table;
		}, table);
	}, []);
	
	const shinyGoldBagIndex = bagNameToId('shiny gold bag'.toCamelCase());
	
	result[0] = unfold(shinyGoldBagIndex).filter(v => v !== shinyGoldBagIndex).length;
	result[1] = howManyBags(bags, shinyGoldBagIndex) - 1;
	
	sendResult();
};
