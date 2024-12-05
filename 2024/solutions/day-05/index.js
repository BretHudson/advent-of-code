export const solution = (input) => {
	const answers = [null, null];

	const [orderingStr, pagesStr] = input.split('\n\n');

	const linesToNumbers = (lines, char) =>
		lines.split('\n').map((line) => line.split(char).map(Number));

	const rules = linesToNumbers(orderingStr, '|');
	const pagesToProduce = linesToNumbers(pagesStr, ',');

	const validatesAllRules = (pages) => {
		return rules
			.filter((rule) => rule.every((o) => pages.indexOf(o) > -1))
			.every(([a, b]) => pages.indexOf(a) < pages.indexOf(b));
	};

	const sumMiddlePages = (pages) => {
		return pages
			.map((pages) => pages[Math.floor(pages.length / 2)])
			.reduce((a, v) => a + v, 0);
	};

	answers[0] = sumMiddlePages(pagesToProduce.filter(validatesAllRules));

	const findWrongRule = (pages) => {
		return rules.findIndex(([a, b]) => {
			const aIndex = pages.indexOf(a);
			return aIndex > -1 && aIndex < pages.indexOf(b);
		});
	};

	const fixedPages = pagesToProduce
		.filter((pages) => !validatesAllRules(pages))
		.map((pages) => {
			const indexOf = pages.indexOf.bind(pages);
			for (let ruleIndex; (ruleIndex = findWrongRule(pages)) > -1; ) {
				let [b, a] = rules[ruleIndex].map(indexOf);
				const temp = pages[b];
				pages[b] = pages[a];
				pages[a] = temp;
			}
			return pages;
		});
	answers[1] = sumMiddlePages(fixedPages);

	return answers;
};
