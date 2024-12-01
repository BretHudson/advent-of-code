# Bret Hudson's Advent of Code Solutions

This monorepo contains all my solutions to Advent of Code in JavaScript! Each year\* has a custom interactive site where users can enter their puzzle inputs and get outputs. While I don't encourage cheating, having a handy GUI to see what the expected answer should be while you're tinkering away at code can be super handy figuring out if your solution is anywhere near correct! Check them out at [advent-of-code.brethudson.com](https://advent-of-code.brethudson.com).

\* not all years have a site at the moment :(
	
Where to find solutions:
- 2015: [/2015](2015)
- 2016: [/2016/js/day](2016/js/day)
- 2017: [/2017/js/day](2017/js/day)
- 2018: [/2018/js/day](2018/js/day)
- 2019: [/2019/js/day](2019/js/day)
- 2020: [/2020/js/day](2020/js/day)
- 2021: [/2021/js/day](2021/js/day)
- 2022: [/2022/solutions](2022/solutions)
- 2023: [/2023/solutions](2023/solutions)
- 2024: [/2024/solutions](2024/solutions)

## The Dashboard

Description:

I want to have a streamlined experience where I can quickly iterate on Advent of Code problems. I have an old solution that somewhat works, but has a few UX shortcomings.

Goals:

- Quickly iterate on solutions with minimal window switching
- Automate certain tasks
  - ✅ Generating a new solution file
  - ✅ Getting input from adventofcode.com
  - ✅ Posting answer to adventofcode.com

Requirements:

- ✅ Hot reloading
- ✅ Infinite loops need to not block main thread
- ✅ Does _not_ need to look nice

Solution:

- Use a WebSocket
- Use web workers
- Create a Node.js server
  - Handles WebSocket connection
- Client-side is all vanilla JS
  - I don't need anything fancy

Stretch Goals:

- ✅ Pull all code blocks in as potential inputs
- 🔳 Test to see if expected output
- 🔳 Custom logger
- 🔳 Playwright

Example problem while we get set up:
- Reverse the letters
- Same as before, sans-vowels

- Not sure how I want to call a solution's code yet
- Response from solution will be a tuple
	- [answer1, answer2]
	- A null answer represents a non-computed value
