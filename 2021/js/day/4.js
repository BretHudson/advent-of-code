importScripts('./../util.js');

onmessage = e => {
	const { input, result, sendResult } = parseEventMessage(e);
	
	const cols = Array.from({ length: 5 }, (_, i) => Array.from({ length: 5 }, (_, j) => j + i * 5));
	const rows = Array.from({ length: 5 }, (_, i) => Array.from({ length: 5 }, (_, j) => j * 5 + i));
	const tests = [...cols, ...rows];
	
	const [numbersInput, ...boardsInput] = input.split('\n\n');
	const numbers = numbersInput.split(',').map(v => +v);
	const boards = boardsInput.map(board => board.split(/\s+/).map(v => +v));
	
	const findWinningBoards = numbersPlayed => board => tests.map(test =>
		test.map(i => numbersPlayed.find(n => n === board[i]))
	).some(test => test.reduce(reduceSum, 0));
	
	const getBoardScore = (board, numbersPlayed) => board.filter(n => numbersPlayed.some(v => v === n) === false).reduce(reduceSum, 0) * numbersPlayed.slice(-1)[0];
	
	const getWinningScore = (boards, numbers) => {
		for (let turn = 1; turn < numbersInput.length; ++turn) {
			const numbersPlayed = numbers.slice(0, turn);
			const winningBoard = boards.find(findWinningBoards(numbersPlayed));
			
			if (winningBoard === undefined) continue;
			
			return getBoardScore(winningBoard, numbersPlayed);
		}
	};
	
	const getLastWinningScore = (boards, numbers) => {
		let winners;
		for (let turn = 1; turn < numbersInput.length; ++turn) {
			const numbersPlayed = numbers.slice(0, turn);
			[winners, boards] = boards.partition(findWinningBoards(numbersPlayed));
			
			if (boards.length > 0) continue;
			
			return getBoardScore(winners[0], numbersPlayed);
		}
	};
	
	result[0] = getWinningScore(boards, numbers);
	result[1] = getLastWinningScore(boards, numbers);
	
	sendResult();
};
