# Advent of Code 2024 Day 3

[Puzzle](https://adventofcode.com/2024/day/3) | [Solution](index.js)

[Language: JavaScript] 41152/33017 (slept through the reveal, oops!)

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

-   [Strings](<https://en.wikipedia.org/wiki/String_(computer_science)>)
-   [Parsing](https://en.wikipedia.org/wiki/Parsing)
-   [Regular Expressions (Regex)](https://www.regular-expressions.info/)

---

## Input

Today, I'm going to handle parsing the input in each part, since we'll be adjusting it as we go. We're going to be parsing a long string of instructions with "corrupted memory" such as the one below:

`xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))`

---

## Part 1

For part one, our goal is to find each `mul(X, Y)` instruction, multiply the arguments `X` and `Y` together, and add the product to a running sum. The above example produces `161`. For more details, refer to the [puzzle description](https://adventofcode.com/2024/day/3).

### Approaches

**💡 Regular Expressions (Regex)**

<details>

<summary>Finding all `mul(X,Y)` instructions with regex</summary>

[Regular expressions](https://www.regular-expressions.info/) are well outside the scope of this article. They allow the programmer to run pattern matching against a string. For those unfamiliar, it can look like gibberish, but with experience, regex can become a powerful tool in your tool belt. My submitted [solution](index.js) will use regex, but for this guide, I'll skip it.

</details>

**💡 Manual Parsing**

<details>

<summary>Doing a simple parse of the string, chunk by chunk</summary>

This will certainly be more code to write, but it'll be easier to understand for newcomers than regex. For that purpose, I'll write out this tutorial this way to keep it accessible.

</details>

### Solution

To parse the string, we'll employ the use of `.substring()` ((docs)[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substring]). We'll take the substring of our input at each index and compare the beginning with `'mul'` to see if we have a match. From there, we'll do a similar operation to find each portion of `mul(X,Y)`.

We'll use a variable called `cursor` to keep track of where we are in the string, and a variable called `consumed` to keep track of how many characters we've read in the current step.

Let's write the world's cruddiest, most hard-coded parser! Here's the boilerplate:

```js
let cursor = 0;
while (cursor < input.length) {
	let consumed = 0;

	let str = input.substring(cursor);
	if (str.startsWith('mul(')) {
		consumed += 4; // we've consumed 'mul'
		// [...we'll write more code here]
	} else {
		// make sure we move forward at least one character each step
		consumed = 1;
	}

	cursor += consumed;
}
```

Now that we've found `'mul('`, let's find the closing `')'` at the end of the string and create a new substring

```js
	if (str.startsWith('mul(')) {
		consumed += 4;
		str = str.substring(4, str.indexOf(')'));
	} else {
```

Given `mul(3, 4)`, `str` will now be equal to `'3, 4'`. If we're given `mul(32,64]then(mul(11,8)` (note the `]` after `64`), `str` will be equal to `32,64]then(mul(11,8`.

From here, we need to extract the arguments, check that there are exactly two, and that each one is indeed a number.

```js
	if (str.startsWith('mul(')) {
		consumed += 4;
		str = str.substring(4, str.indexOf(')'));

		const args = str.split(',');
		if (args.length === 2) {
			const X = args[0];
			const Y = args[1];
			// are X and Y numbers?
			if (!isNaN(X) && !isNaN(Y)) {
				// create the instruction, converting X & Y from strings to numbers
				const instruction = [Number(X), Number(Y)];
				// push those arguments into the instructions array
				instructions.push(instruction);
				consumed += str.length + 1; // `+ 1` to cover the ')'
			}
		}
	} else {
```

#### Using the Instructions

Now that we have all of our instructions, we can loop over them, find the product, and sum them up.

```js
let sum = 0;
for (let i = 0; i < instructions.length; ++i) {
	const instr = instructions[i];
	sum += instr[0] * instr[1];
}
```

Let's hope the code we've written isn't too hard to modify for part 2...

---

## Part 2

For part 2, we need to parse two more instructions: `don't()` and `do()`. These toggle a variable we will call `enabled`, which tells our program whether or not proceeding `mul(X,Y)` instructions should be counted or not. `don't()` will set `enabled` to `false`, `do()` will set `enabled` to `true`.

### Approaches

The approaches for this one are the same as in the previous part.

### Solution

#### Improve Saved Instruction Data

We'll need to modify our parser to be able to read in multiple types of instructions. First, let's change the `instruction` variable to hold three values, the first of which being the instruction name.

```js
const instruction = ['mul', Number(X), Number(Y)];
```

We'll now need to update our loop to take this into account. Since we'll have multiple types of instructions, I'm going to use a `switch` case to handle each type of instruction.

```js
sum = 0;
for (let i = 0; i < instructions.length; ++i) {
	const instr = instructions[i];
	switch (instr[0]) {
		case 'mul':
			sum += instr[1] * instr[2];
			break;
	}
}
```

#### Adding `don't()` and `do()`

Thankfully, it's not too tricky to append these extra cases to our parser with the way it's currently written. All we need to do is supply some `else if` cases to check for the substrings. We'll grab both parenthesis in the check since there aren't any arguments for either of these instructions.

```js
if (str.startsWith('mul(')) {
	// [...]
} else if (str.startsWith("don't()")) {
	consumed += 7;
	instructions.push(["don't"]);
} else if (str.startsWith('do()')) {
	consumed += 4;
	instructions.push(['do']);
} else {
	consumed = 1;
}
```

Once we have these, we can change our loop to toggle an `enabled` variable when each of these instructions are hit.

```js
let sum = 0;
let enabled = true;
for (let i = 0; i < instructions.length; ++i) {
	const instr = instructions[i];
	switch (instr[0]) {
		case 'mul':
			if (enabled) {
				sum += instr[1] * instr[2];
			}
			break;
		case "don't":
			enabled = false;
			break;
		case 'do':
			enabled = true;
			break;
	}
}
```

And there we have it! If you'd like to see what this looks like when using regex, view my [final solution](index.js).
