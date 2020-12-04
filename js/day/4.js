importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const createField = (name, regex, checkValid = null, required = true) => {
		return {
			name,
			regex: new RegExp(regex),
			required,
			checkValid
		}
	};
	
	const createNumber = (name, digits, min, max) => {
		return {
			...createField(name, `(\\d{${digits}})$`),
			checkValid: result => {
				const [, number] = result;
				return (number >= min) && (number <= max);
			}
		};
	};
	
	const heightRanges = { 'cm': [150, 193], 'in': [59, 76] };
	
	const checkValidHeight = result => {
		const [, height, unit] = result;
		const [min, max] = heightRanges[unit] || [-1, -1];
		return (height >= min) && (height <= max);
	};
	
	const fields = [
		createNumber('byr', 4, 1920, 2002),
		createNumber('iyr', 4, 2010, 2020),
		createNumber('eyr', 4, 2020, 2030),
		createField('hgt', '^(\\d+)([a-z]+)$', checkValidHeight),
		createField('hcl', '^#([0-9a-f]{6})$'),
		createField('ecl', '^(amb|blu|brn|gry|grn|hzl|oth)$'),
		createField('pid', '^(\\d{9})$'),
		createField('cid', null, null, false),
	].filter(field => field.required === true);
	
	const fieldLookupTable = fields.reduce((obj, field) => ((obj[field.name] = field), obj), {});
	
	const passports = input.split('\n\n').map(passport => {
		return Object.fromEntries(passport.split('\n').flatMap(v => v.split(' ')).map(v => v.split(':')));
	}).filter(passport => fields.every(({ name }) => passport[name] !== undefined));
	
	result[0] = passports.length;
	
	result[1] = passports.filter(passport => {
		return Object.entries(passport).every(([key, value]) => {
			const field = fieldLookupTable[key];
			if (field === undefined)
				return true;
			
			const { regex, checkValid } = field;
			const result = regex.exec(value);
			
			if (result !== null)
				return checkValid?.(result) ?? true;
			
			return false;
		});
	}).length;
	
	sendResult();
};
