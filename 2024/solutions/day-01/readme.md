# Advent of Code 2024 Day 1

[Puzzle](https://adventofcode.com/2024/day/1) | [Solution](index.js)

[Language: JavaScript] 858/629

Today's puzzle was pretty simple, a great start to the year. The leaderboard, as always, was super competitive, with it filling up after just 2 minutes and 31 seconds after posting. Wow!

---

## Table of Contents

1. [Topics](#topics)
1. [Input](#input)
1. [Part 1](#part-1)
    1. [Approaches](#approaches)
    2. [Solution](#solution)
1. [Part 2](#part-2)
    1. [Approaches](#approaches-1)
    2. [Solution](#solution-1)

---

## Topics

-   [Sorting](https://en.wikipedia.org/wiki/Sorting_algorithm)
-   [Hash table](https://en.wikipedia.org/wiki/Hash_table) (aka Hash map, dictionary, map)

---

## Input

Today's input is a list of [tuples](https://en.wikipedia.org/wiki/Tuple). Each tuple contains two integers, representing a "location ID."

Example:

```
3   4
4   3
2   5
1   3
3   9
3   3
```

To parse the input, I simply went over each line and added each item to a separate list:

```js
const list1 = [];
const list2 = [];
const lines = input.split('\n');
for (let i = 0; i < lines.length; ++i) {
	const items = lines[i].split('   '); // there are three spaces between numbers
	list1.push(Number(items[0]));
	list2.push(Number(items[1]));
}
```

In my actual solution, I took a slightly different approach to writing this:

```js
const pairs = input.split('\n').map((line) => {
	// map each line to a tuple
	// ex: '3   4' => ['3', '4'] => [3, 4]
	return line.split('   ').map((v) => Number(v));
});

// map the pairs to lists
const list1 = pairs.map((pair) => pair[0]);
const list2 = pairs.map((pair) => pair[1]);
```

At the end of the day, both snippets give you the same list.

---

## Part 1

Our goal is to pair up the smallest number on the left list with the smallest number on the right list, and then do the same for the second-smallest number in each list, until we've paired them all up. For each pair, we find the distance between the numbers, and then sum up all the distances.

In the example above, the first pair is `1` and `3`, which has a distance of `2`. The sum of all the distances (`2 + 1 + 0 + 1 + 2 + 5`) is `11`.

### Approaches

Note: `n` will refer to the number of items in a list.

**💡 Loop over the input `n` times.**

<details>

<summary>Each iteration, we find the smallest in each list, and then remove them from the list/disqualify them in future iterations.</summary>

The basic idea for finding the smallest would be as follows:

```js
// do this for each list
let smallest = Number.POSITIVE_INFINITY;
for (let i = 0; i < list.length; ++i) {
	if (list[i] < smallest) {
		smallest = list[i];
	}
}
```

alternatively

```js
let smallest = Number.POSITIVE_INFINITY;
for (let i = 0; i < list.length; ++i) {
	smallest = Math.min(list[i], smallest);
}
```

or even

```js
const smallest = Math.min(...list);
```

From here, you'd take each list's smallest, get the distance between them, and then remove them from each list so they aren't used again.

I fear that part 2's goal wouldn't nicely extend from this approach.

</details>

**💡 Sort each list**

Sorting each list will give us the values from smallest to largest (ascending order), letting us just loop over them! This is the solution I chose, as it was quick to write and had the potential of making part 2 quicker to solve.

I will explain this approach below.

### Solution

Using `list1` and `list2` from the [input parsing](#input) I posted above, this became quite trivial to do in JavaScript:

```js
list1.sort();
list2.sort();
```

Viola! Both lists are sorted. If we find out in part 2 that it's important to have each list in its original order, we could instead do the following:

```js
const sortedList1 = list1.toSorted();
const sortedList2 = list2.toSorted();
```

> [!NOTE]
> The difference between `.sort()` ([docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)) and `.toSorted()` ([docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)) is that `.sort()` sorts the array in place, whereas `.toSorted()` creates a copy, keeping the original array untouched.

Now that we have our lists sorted, getting the distances becomes trivial.

```js
let sum = 0;
// loop over each item (list1.length or list2.length works here)
for (let i = 0; i < list1.length; ++i) {
	const a = list1[i];
	const b = list2[i];

	// Math.abs(3 - 1) => Math.abs(2) => 2
	// Math.abs(2 - 3) => Math.abs(-1) => 1
	const distance = Math.abs(a - b);
	sum += distance;
}
```

or as I wrote in my solution

```js
const distances = list1.map((a, index) => {
	// first iter:  a = 1, index = 0, thus list2[index] => list2[0] => 3
	// second iter: a = 2, index = 1, thus list2[index] => list2[1] => 2
	return Math.abs(a - list2[index]);
});
const sum = distances.reduce((acc, v) => acc + v, 0);
```

Viola! Not too tricky. Now let's find out what part 2 is!

---

## Part 2

Our goal for part 2 is to find how many times each item on the left list shows up in the right list. We then multiply the item in the left list by the occurance count in the right list to get a "similarity score," of which we'll sum in a similar way to how we summed the distances.

```
3   4
4   3
2   5
1   3
3   9
3   3
```

For the first item in the left list, `3`, it shows up `3` times in the right list. `3 * 3` gives us a score of `9`.

Next is `4`, which shows up `1` time. `4 * 1` gives us a score of `4`.

The sum of all scores (`9 + 4 + 0 + 0 + 9 + 9`) is `31`.

### Approaches

**💡 Do a simple loop**

<details>

<summary>For each item in the left list, loop over the entire right list.</summary>

This is the solution that I chose, mainly because JavaScript has some nice functionality to do this in a single line. It is the slower of the two solutions, as you have to loop over the right list every single time, bringing the time complexity to O(N^2).

I will explain this approach below in [Solution](#solution-1).

</details>

**💡 Create a hash table**

<details>

<summary>By looping over the right list once, we can create a mapping of each number to how many times it shows up.</summary>

This is the more performant solution, although I didn't chose this one while aiming for the leaderboard. Within the hash table/map, each key represents a value in the right list, and that slot contains the number of times it appears in the list.

I will explain this approach below in addition to the previous approach.

</details>

### Solution

The simpler solution, while slower, has us looping over the right list for each item of the left list.

```js
let sum = 0;
// loop through each item in the left list
for (let i = 0; i < list1.length; ++i) {
	const value = list1[i];
	let occurances = 0;
	// loop through each item in the right list
	for (let j = 0; j < list2.length; ++j) {
		// if the items are the same value, increment `occurances`
		if (list2[j] === value) {
			++occurances;
		}
	}
	// get the score and add it to the sum
	const score = value * occurances;
	sum += score;
}
```

As per usual, there is a more concise way to write this. We can leverage `.filter()` ([docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)) to replace the inner loop.

```js
let sum = 0;
// loop through each item in the left list
for (let i = 0; i < list1.length; ++i) {
	const value = list1[i];
	// filter list2 to just hold the items that match
	const occurances = list2.filter((v) => {
		return v === value;
	}).length;
	// get the score and add it to the sum
	const score = value * occurances;
	sum += score;
}
```

This is close to what I did in my solution. Instead of using a `for` loop, I instead leveraged `.map()` ([docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)) and `.reduce()` ([docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)).

```js
const sum = list1
	.map((v) => {
		// multiply the value by the length of the filtered list
		return v * list2.filter((o) => o === v).length;
	})
	// sum them all up using .reduce()
	.reduce((a, v) => a + v, 0);
```

> [!warning]
> The above solution isn't overly performant!

#### Constructing the Hash Table

Let's instead leverage a hash table/map to find the occurances, so we only have to loop over each list once, instead of looping over the right list for every item in the left list. Even `.filter()` is doing a loop under the hood.

In JavaScript, we can do this pretty simply using objects.

```js
const hashTable = {};
for (let i = 0; i < list2.length; ++i) {
	const value = list2[i];
	// check if the value exists in the table
	if (hashTable[value] === undefined) {
		// default it to zero
		hashTable[value] = 0;
	}
	// increment the value
	++hashTable[value];
}
```

> [!warning]
> Depending on the size of your data, using a JavaScript object in this way can end up being rather slow, as the V8 engine isn't able to perform certain optimizations for read/write operations within the object. Thankfully, the below solution can solve that, although it's not necessary for this puzzle.

However, if you're in another language, this shortcut won't work. In that case, you'd need to code up a hash map data structure or use one provided by your language. In JavaScript, we have access to `Map` ([docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)).

```js
const map = new Map();
for (let i = 0; i < list2.length; ++i) {
	const value = list2[i];
	// default occurances to 0
	let occurances = 0;
	// if we've already added it before...
	if (map.has(value)) {
		// ...retrieve the current value
		occurances = map.get(value);
	}
	// increment the value in the map!
	map.set(value, occurances + 1);
}
```

#### Using the Hash Table

Using the hash table/map is pretty simple, as can be seen below:

```js
let sum = 0;
for (let i = 0; i < list1.length; ++i) {
	const value = list1[i];
	const occurances = hashTable[value]; // or map.get(value)
	// if it's not in the table...
	if (occurances === undefined) {
		// ...let's move onto the next value!
		continue;
	}
	// compute the score and add it to
	const score = value * occurances;
	sum += score;
}
```

However, in my solution, I once again leveraged `.map()` and `.reduce()`, along with `??` (the nullish coalescing operator, [docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)) to write a more concise version of this code:

```js
const sum = list1
	.map((value) => {
		return value * (hashTable[value] ?? 0); // or map.get(value)
	})
	.reduce((a, v) => a + v);
``;
```

The reason we need to use `??` is because there is no guarantee that the number in the left list even exists in the right list! In those cases, the map will return `undefined`, so we need to swap that with a `0` or else risk getting `NaN`.

[My final solution](index.js)
