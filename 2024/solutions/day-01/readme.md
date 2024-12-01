# Advent of Code 2024 Day 1

[Solution](index.js)

[Language: JavaScript] 858/629

Today's puzzle was pretty simple, a great start to the year. The leaderboard, as always, was super competitive, with it filling up after just 2 minutes and 31 seconds after posting. Wow!

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
	// map each line to a tuple (ex: [3, 4])
	return line.split(/\s+/g).map(Number);
});

// map the pairs to lists
const list1 = pairs.map(([v]) => v);
const list2 = pairs.map(([_, v]) => v);
```

## Part 1

Our goal is to pair up the smallest number on the left list with the smallest number on the right list, and then do the same for the second-smallest number in each list, until we've paired them all up.

### Approaches

1. Double for loop
2. Sort each list

## Part 2
