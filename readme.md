Description:

I want to have a streamlined experience where I can quickly iterate on Advent of Code problems. I have an old solution that somewhat works, but has a few UX shortcomings.

Goals:

- Quickly iterate on solutions with minimal window switching
- Automate certain tasks
  - Generating a new solution file
  - Getting input from adventofcode.com
  - Posting answer to adventofcode.com

Requirements:

- Hot reloading
- Infinite loops need to not block main thread
- Does _not_ need to look nice

Solution:

- Use a WebSocket
- Use web workers
- Create a Node.js server
  - Handles WebSocket connection
- Client-side is all vanilla JS
  - I don't need anything fancy

Stretch Goals:

- Pull all code blocks in as potential inputs
- Test to see if expected output
- Custom logger
- Playwright

Example problem while we get set up:
- Reverse the letters
- Same as before, sans-vowels

- Not sure how I want to call a solution's code yet
- Response from solution will be a tuple
	- [answer1, answer2]
	- A null answer represents a non-computed value
