export const config = {
	cacheDir: '.cache',
	getFileName: (year, day) => {
		const day2 = day.toString().padStart(2, '0');
		switch (year) {
			case 2015:
				return null;
			case 2016:
			case 2017:
			case 2018:
			case 2019:
			case 2020:
			case 2021:
				return `./${year}/js/day/${day}.js`;
			case 2022:
			case 2023:
				return `./${year}/solutions/day-${day}.js`;
			default:
				return `./${year}/solutions/day-${day2}/index.js`;
		}
	},
	getTemplateFileName: (year) => {
		switch (year) {
			case 2015:
				return null;
			case 2016:
			case 2017:
			case 2018:
			case 2019:
			case 2020:
			case 2021:
				return `./${year}/js/day/0.js`;
			case 2022:
			case 2023:
				return `./${year}/solutions/day-0.js`;
			default:
				return `./${year}/solutions/_template.js`;
		}
	},
};
