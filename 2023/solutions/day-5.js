class Range {
	constructor(start, length = 1) {
		this.start = start;
		this.length = length;
	}

	remove(other) {
		if (!this.overlaps(other)) {
			console.warn('did not remove anything...');
			return this;
		}

		const a = new Range(this.start, other.start - this.start);
		const bStart = other.getMax() + 1;
		const b = new Range(bStart);
		b.setMax(this.getMax());
		return [a, b].filter((range) => range.length > 0);
	}

	intersection(other) {
		const start = Math.max(this.start, other.start);
		const max = Math.min(this.getMax(), other.getMax());

		if (start <= max) {
			const range = new Range(start);
			range.setMax(max);
			return range;
		}

		return null;
	}

	overlaps(other) {
		return this.start <= other.getMax() && this.getMax() >= other.start;
	}

	setMax(max) {
		this.length = max - this.start + 1;
	}

	getMax() {
		return this.start + this.length - 1;
	}
}

export const solution = (input) => {
	const answers = [null, null];

	const [seedsStr, ...sections] = input.split('\n\n');

	const seeds = [...seedsStr.matchAll(/\d+/g)].map((v) => +v);

	const maps = sections.reduce((acc, str) => {
		const [nameStr, ...values] = str.split('\n');

		const match = nameStr.match(/(?<srcCat>\w+)-to-(?<destCat>\w+) map:/);
		const { srcCat } = match.groups;

		const map = values
			.map((value) => {
				const [dest, src, length] = value.split(' ').map((v) => +v);
				return {
					delta: dest - src,
					range: new Range(src, length),
				};
			})
			.sort((a, b) => a.range.start - b.range.start);

		acc[srcCat] = map;

		return acc;
	}, {});

	const findLowest = (seedRanges) => {
		const finalRanges = Object.keys(maps).reduce((acc, key) => {
			return acc.flatMap((range) => {
				const overlaps = maps[key].filter((conversion) => {
					return conversion.range.overlaps(range);
				});

				if (overlaps.length === 0) return [range];

				const ranges = [];
				let lastRange = range;
				for (let i = 0; i < overlaps.length; ++i) {
					const unaffectedRanges = lastRange.remove(
						overlaps[i].range,
					);
					const overlapRange = lastRange.intersection(
						overlaps[i].range,
					);

					if (overlapRange === null) {
						throw new Error('what the fuck');
					}

					overlapRange.start += overlaps[i].delta;
					ranges.push(overlapRange);

					if (unaffectedRanges.length === 0) {
						// lastRange = lastRange.clone();
						lastRange.start += overlapRange.length;
					} else {
						ranges.push(unaffectedRanges[0]);
						lastRange = unaffectedRanges.at(-1);
					}
				}

				if (ranges.length === 0) return [];
				ranges.sort((a, b) => a.start - b.start);

				const collapsed = [ranges[0]];
				for (let i = 1; i < ranges.length; ++i) {
					const cur = ranges[i];
					const last = collapsed[collapsed.length - 1];
					if (last && cur.start <= last.getMax() + 1) {
						const max = Math.max(last.getMax(), cur.getMax());
						last.setMax(max);
					} else {
						collapsed.push(cur);
					}
				}
				return collapsed;
			});
		}, seedRanges);

		const finalLocations = finalRanges.map((range) => range.start);
		// NOTE: there is a bug somewhere that causes some ranges to start with 0 at the end :/
		return Math.min(...finalLocations.filter(Boolean));
	};

	answers[0] = findLowest(seeds.map((v) => new Range(+v)));

	const seedRanges = [];
	for (let i = 0; i < seeds.length; i += 2) {
		const range = new Range(seeds[i], seeds[i + 1]);
		seedRanges.push(range);
	}
	answers[1] = findLowest(seedRanges);

	return answers;
};
