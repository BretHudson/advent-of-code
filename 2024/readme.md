# Advent of Code 2024

## Intro

Another year of [**Advent of Code**](https://adventofcode.com)! I remember "attending" the first event back in 2015, solving the first four days each day and then forgetting about the challenge until 2018. That year, AoC ended up occupying a lot of my time that fall while I was between client work and my first full-time position as a front-end software engineer at Manticore Games.

**Advent of Code** is what took me from being someone that slaps together code to someone that could quickly identify problems, dissect them, and then come up with potential solutions. A lot of this comes from completing (or having difficulty doing so!) each day, and then visiting that day's Solution Megathread on [r/adventofcode](https://www.reddit.com/r/adventofcode/) - each of which are full of brilliant folks sharing their solutions. There is so much knowledge to be gained by seeing how other people have approached each problem.

That is part of why I'm writing little walkthroughs for each day! The other part is that I need to flex my writing muscles. I used to be an Honors English student, but now... oof. My writing is not what it once was. :P

## Why You Should Do Advent of Code

1. It's way more fun than grinding LeetCode. In fact, when I used to be a tutor, I would recommend my students do AoC in lieu of LeetCode for interview prep.
2. There is a community of folks at [r/adventofcode](https://www.reddit.com/r/adventofcode/) sharing tips and offering help to anyone stuck.
3. The community offers a kind, welcoming social sphere during the holidays.
4. The [breadth of problems](https://www.reddit.com/r/adventofcode/comments/1gdw4cj/450_stars_a_categorization_and_megaguide/) is very comprehensive - from cellular automata to pathfinding, optimization to reverse engineering, AoC covers a lot of ground.
5. Practice makes perfect.

## About These Write-ups

Within these posts, I will discuss possible solutions, their trade-offs, and my train of thought as I go through the problems. With my star count from the first nine years sitting at 348/450, I've gotten used to Part 2 of each day throwing a curveball, and sometimes try to write Part 1 in a way that will be easy to modify/extend for whatever lies ahead.

As I do every year, I use JavaScript to solve the problems. With my own personal growth and additions to JavaScript's feature set, my style has changed quite considerably over the years. I make use of a lot of array methods (`.map()`, `.filter()`, `.reduce()`, etc) in my code, which can be a bit hard to grok for those not familiar with that particular flavor of functional programming. I do tend to avoid OOP (Object-Oriented Programming) in my solutions, leaning in favor of a more DOD (Data-Oriented Design) approach.

## Using My Solutions

While I do not condone cheating, I do encourage folks to run their input against my solutions to see what their target answer is. I've done this every year to help me figure out if I'm even close (do I have an off-by-one error?) or if I've completely missed the mark. These solutions are written in a way that will run in your browser, so feel free to copy/paste them into your Dev Tools console (remove the `export` at the beginning).

```js
// copy/paste the solution, removing `export` from the beginning
const solution = (input) => {
	// [imagine there's a bunch of code right here]
};

// call the solution
let answer = solution('[my puzzle input]');

// or, for multi-line inputs, use backticks (`)
answer = solution(`[my
input
is
multiple
lines]`);

console.log(answer);
```

## ⭐ Have fun and learn tons! ⭐
