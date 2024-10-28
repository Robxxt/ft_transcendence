
class TicTacToeModel {
	// handle logic of a game
	// provide methods to place rings, switch players, and check for a win

	constructor() {
		this.upd = {
			turn: 2,
			cell: null,
			isSelected: false,
			ringSize: null,
			winCombo: null,
			draw: false
		};
		this.sides = [[], []];
		this.board = [];

		this.winCombinations = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
								[1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

		this.initBoard();
	}

	initBoard() {
		// null (no set ring), 0 (left), 1 (right)
		for (let i = 0; i != 9; i++) {
			this.board.push([null, null, null]);
		}

		// null (ring placed), selected, used
		for (let i = 0; i != 2; i++) {
			this.sides[i].push([null, null, null], [null, null, null]);
		}
	}

	isEnd() {
		if (this.isWin()) {
			return true;
		}
		if (!this.canPlaceRing()) {
			this.upd.draw = true;
			return true;
		}
		return false;
	}

	isCellWin(cell) {
		for (let i = 0; i !=3; i++) {
			if(cell[i] == null)
				continue;

			return cell[i] == this.upd.turn;
		}
		return false;
	}

	getWin() {
		return this.winCombinations.find(combination => {
			return combination.every(index => {
				return this.isCellWin(this.board[index])
			});
		});
	}

	isWin() {
		this.upd.winCombo = this.getWin();

		if(this.upd.winCombo != null) {
			for (const index of this.upd.winCombo) {
				const cell = this.board[index];
				for (let i = 0; i != 3; i++) {
					if (cell[i] === null)
						continue;

					cell[i] = 'win';
					break;
				}
			}
		}
		return this.upd.winCombo != null;
	}

	isRingFits(boardCell, ringSize) {
		let redRing = this.board[boardCell].indexOf(0);
		let blueRing = this.board[boardCell].indexOf(1);
		let rings = [redRing, blueRing].filter(ring => ring !== -1);
		if (rings.length === 0) {
			return true;
		}
		if (Math.min(...rings) > ringSize) {
			return true;
		}
		return false;
	}

	canPlaceRing() {
		for (let cell = 0; cell != 2; cell++) {
			let unusedRing = this.sides[this.upd.turn ^ 1][cell].indexOf(null);
			if (unusedRing == -1) {
				continue;
			}
			for (let boardCell = 0; boardCell != 9; boardCell++) {
				if (this.isRingFits(boardCell, unusedRing)) {
					return true;
				}
			}
		}
		return false;
	}

	selectRing(index) {
		if (this.containsNan(index)) {
			console.error('index contains Nan');
			return false;
		}
		if (this.upd.turn != index[0] && this.upd.turn != 2) {
			console.log('turn is wrong');
			return false;
		}
		if (this.upd.isSelected === true) {
			if (this.upd.cell != index[1]) {
				const i = this.sides[index[0]][this.upd.cell].indexOf('selected');
				if (i != -1) {
					this.sides[index[0]][this.upd.cell][i] = null;
					this.upd.isSelected = false;
				}
			}
		}

		for (let ring = 0; ring != 3; ring++) {
			if (this.sides[index[0]][index[1]][ring] == 'used') {
				continue;
			}
			if (this.sides[index[0]][index[1]][ring] == 'selected') {
				this.sides[index[0]][index[1]][ring] = null;
				this.upd.isSelected = false;
				this.upd.ringSize = null;
				continue;
			}
			if (this.upd.isSelected == false) {
				this.sides[index[0]][index[1]][ring] = 'selected';
				this.upd.turn = index[0];
				this.upd.cell = index[1];
				this.upd.isSelected = true;
				this.upd.ringSize = ring;
				break;
			}
		}
		return true;
	}

	placeRing(index) {
		if (isNaN(index)) {
			return false;
		}
		let isEmpty = this.board[index].indexOf(null);
		if (isEmpty == -1) {
			return false;
		}
		for (let ring = 0; ring != 3; ring++) {
			if (this.board[index][ring] != null) {
				if (this.upd.ringSize > ring) {
					return false;
				}
			}
			if (this.upd.ringSize == ring) {
				if (this.board[index][ring] == null) {
					this.board[index][ring] = this.upd.turn;
					this.sides[this.upd.turn][this.upd.cell][ring] = 'used';
					this.upd.isSelected = false;
					this.upd.ringSize = null;
					break;
				}
			}
		}
		return true;
	}

	switchTurn() {
		this.upd.turn = this.upd.turn ^ 1;
	}

	containsNan(index) {
		for (let i = 0; i != index.length; i++) {
			if (isNaN(index[i])) {
				return true;
			}
		}
		return false;
	}
}

class TicTacToeView {
	// display the game board and rings
	// handle user interactions (e.g., clicking on cells to place rings)

	constructor() {
		this.template = this.getElement('.template');
		this.redGrid = this.getElement('.side[data-color="0"]');
		this.blueGrid = this.getElement('.side[data-color="1"]');
		this.grid = this.getElement('.grid');
		this.sides = [this.redGrid, this.blueGrid];

		this.initGrid();
	}

	getElement(selector) {
		const element = document.querySelector(selector);
		return element;
	}

	initGrid() {
		for(const side of this.sides) {
			for(let i = 0; i != 2; i++) {
				const clone = this.template.cloneNode(true);
				const color = side.getAttribute('data-color');
				clone.classList.remove('template');
				clone.setAttribute('data-color', color);
				clone.setAttribute('data-index', i);
				clone.classList.add('side');
				side.appendChild(clone);
			}
		}

		for(let i = 0; i != 9; i++) {
			const clone = this.template.cloneNode(true);
			clone.classList.remove('template');
			clone.setAttribute('data-index', i);
			clone.classList.add('grid');
			this.grid.appendChild(clone);
		}
	}

	clearClasses() {
		for (let i = 0; i != 2; i++) {
			this.sides[i].querySelectorAll('.cell').forEach(cell => {
				const rings = cell.querySelectorAll('.ring');
				rings.forEach(ring => {
					ring.classList.remove('used', 'selected')
				});
			});
		}

		const cells = this.grid.querySelectorAll('.grid');
		cells.forEach(cell => {
			const rings = cell.querySelectorAll('.ring');
			rings.forEach(ring => {
				ring.classList.remove('left', 'right', 'win');
			});
		});

		document.querySelector('.board').classList.remove('win');
	}

	bindBoardClick(handler) {
		const cells = this.grid.querySelectorAll('.grid');
		cells.forEach(cell => {
			cell.addEventListener('click', event => {
				let index = null;
				const target = event.target;
				const cell = target.closest('.cell');
				if (cell.classList.contains('grid')) {
					index = parseInt(cell.getAttribute('data-index'));
					handler(index);
				}
			})
		})
	}

	bindSideClick(handler) {
		this.sides.forEach(side => {
			side.querySelectorAll('.cell').forEach(cell => {
				cell.addEventListener('click', event => {
					const index = [];
					const target = event.target;
					const cell = target.closest('.cell');
					if (cell.classList.contains('side')) {
						index.push(parseInt(cell.getAttribute('data-color')));
						index.push(parseInt(cell.getAttribute('data-index')));
						handler(index);
					}
				});
			});
		});
	}

	renderBoard(board) {
		const cells = this.grid.querySelectorAll('.grid');
		cells.forEach((cell, index) => {
			const rings = cell.querySelectorAll('.ring');
			rings.forEach((ring, i) => {
				const ringStatus = board[index][i];
				if (ringStatus === 0) {
					ring.classList.add('left');
					// ring.style.backgroundColor = this.controller.player1Color;
				} else if (ringStatus === 1) {
					ring.classList.add('right');
					// ring.style.backgroundColor = this.controller.player2Color;
				} else if (ringStatus === 'win') {
					ring.classList.add('win');
					document.querySelector('.board').classList.add('win');
				}
			});
		});
	}

	renderSides(modelSides) {
		for (let side = 0; side != 2; side++) {
			this.sides[side].querySelectorAll('.cell').forEach((cell, index) => {
				const cellData = modelSides[side][index];
				const rings = cell.querySelectorAll('.ring');
				rings.forEach((ring, i) => {
					const ringStatus = cellData[i];
					if (ringStatus === 'used') {
						ring.classList.add('used');
						ring.classList.remove('selected');
					} else if (ringStatus === 'selected') {
						ring.classList.add('selected');
						ring.classList.remove('used');
					} else {
						ring.classList.remove('used');
						ring.classList.remove('selected');
					}
					// Apply the player colors to the sides
					// if (i === 0) {
					// 	ring.style.backgroundColor = this.controller.player1Color;
					// } else if (i === 1) {
					// 	ring.style.backgroundColor = this.controller.player2Color;
					// }
				});
			});
		}
	}
}

function getCssVariable(variableName) {
    // Use getComputedStyle to get the root element's style
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}


class TicTacToeController {
	// capture user actions (like clicks), update the model, and tell the view to refresh
	// model and view should communicate via controller

	constructor(model, view) {
		this.model = model;
		this.view = view;
		this.winner = null;
		this.first = null;
		this.player1Color = '#ff00ff';
		this.player2Color = '#00dcff';

		// Example: Get the value of --player1-color

		// this.player1Color = localStorage.getItem("player1Color");
		// if (!this.player1Color)
		// {
		// 	this.player1Color = getCssVariable('--player1-color');
		// }
		// this.player2Color  = localStorage.getItem("player2Color");
		// if(!this.player2Color){
		// 	this.player2Color = getCssVariable('--player2-color');

		// }

		this.restartButton = document.getElementById('restartButton');
		this.howToPlayButton = document.getElementById('howToPlayButton');
		this.settingsButton = document.getElementById('settingsButton');
		this.submitButton = document.getElementById('submitButton');

		this.gameEndMessage = document.getElementById('gameEndMessage');
		this.instuctions = document.getElementById('instructions');
		this.settingsSetup = document.getElementById('settings');

		this.restartButton.addEventListener('click', () => this.startGame());
		this.howToPlayButton.addEventListener('click', () => this.showInstructions(true));
		this.instuctions.addEventListener('click', () => this.showInstructions(false));
		this.settingsButton.addEventListener('click', () => this.settings(true));
		this.submitButton.addEventListener('click', () => this.settings(false));

		this.colorBoxes = document.querySelectorAll('.color-box');
		this.colorBoxes.forEach(box => {
			box.addEventListener('click', () => {
				const selectedColor = box.getAttribute('data-color');

				if (box.parentElement.parentElement.children[0].textContent.includes('Player 1')) {
					this.player1Color = selectedColor;
				} else if (box.parentElement.parentElement.children[0].textContent.includes('Player 2')) {
					this.player2Color = selectedColor;
				}
				console.log(`color 1 event lis: ${this.player1Color}`);
				console.log(`color 2 event lis: ${this.player2Color}`);
				this.updateColors();
			});
		});

		this.view.bindSideClick(this.handleSideClick);
		this.view.bindBoardClick(this.handleBoardClick);

		// document.documentElement.style.setProperty('--player1-color', '#ff4500');
		// document.documentElement.style.setProperty('--player2-color', '#6a5acd');
		// document.documentElement.style.setProperty('--shadow1', '#ff4500' + '80');
		// document.documentElement.style.setProperty('--shadow2', '#6a5acd' + '80');

		// Dynamically update the names
		// document.getElementById('player1Name').textContent = `Change color for ${player1}:`;
		// document.getElementById('player2Name').textContent = `Change color for ${player2}:`;

		this.updateColors();
		this.startGame();

		// Escape
		window.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && this.settingsSetup.classList.contains('show')) {
				this.settings(false);
			}
			if (event.key === 'Escape' && this.instuctions.classList.contains('show')) {
				this.showInstructions(false);
			}
		});

		//window.addEventListener("DOMContentLoaded", this.loadPlayerColors);

	}

	settings(show) {
		this.settingsSetup.classList.toggle('show', show);
		// this.updateColors();
	}

	// Function to check for saved colors in local storage on page load
	 loadPlayerColors() {
    	// Retrieve colors from local storage
		const savedPlayer1Color = localStorage.getItem("player1Color");
		const savedPlayer2Color = localStorage.getItem("player2Color");

		// If colors are saved, set them as CSS variables
		if (savedPlayer1Color) {
			document.documentElement.style.setProperty("--player1-color", savedPlayer1Color);
		}
		if (savedPlayer2Color) {
			document.documentElement.style.setProperty("--player2-color", savedPlayer2Color);
		}
	}

	updateColors() {
		console.log(`color 1: ${this.player1Color}`);
		console.log(`color 2: ${this.player2Color}`);


		// localStorage.setItem("player1Color", this.player1Color);
		// localStorage.setItem("player2Color", this.player2Color);

		document.documentElement.style.setProperty('--player1-color', this.player1Color);
		document.documentElement.style.setProperty('--player2-color', this.player2Color);
		document.documentElement.style.setProperty('--shadow1', this.player1Color + '80');
		document.documentElement.style.setProperty('--shadow2', this.player2Color + '80');
	}

	startGame() {
		this.gameEndMessage.classList.remove('show', 'left-wins', 'right-wins');
		this.model.upd.turn = 2;
		this.model.upd.cell = null;
		this.model.upd.isSelected = false;
		this.model.upd.ringSize = null;
		this.model.upd.winCombo = null;
		this.model.upd.draw = false;
		this.model.sides = [[], []];
		this.model.board = [];
		this.model.initBoard();
		this.view.clearClasses();
		this.view.renderBoard(this.model.board);
		this.view.renderSides(this.model.sides);
	}

	handleSideClick = index => {
		if (!this.model.selectRing(index)) {
			return;
		}
		if (this.first === null) {
			this.first = this.model.upd.turn;
			console.log('first move from player ', this.first);
		}
		this.view.renderSides(this.model.sides);
	}

	handleBoardClick = index => {
		if (!this.model.placeRing(index)) {
			return;
		}
		if (this.model.upd.turn === 2)
			return;
		this.view.renderBoard(this.model.board);
		this.view.renderSides(this.model.sides);
		if (this.model.isEnd()) {
			this.endGame();
		}
		else {
			this.model.switchTurn();
		}
	}

	endGame() {
		if (this.model.upd.draw == true) {
			this.gameEndMessage.innerText = "DRAW";
			this.gameEndMessage.classList.add('draw');
		} else {
			this.view.renderBoard(this.model.board);
			this.gameEndMessage.innerText = `${this.model.upd.turn ? "BLUE" : "RED"}\nWINS`;
			this.gameEndMessage.classList.add(`${this.model.upd.turn ? "right" : "left"}-wins`);
			console.log(`${this.model.upd.turn ? "right" : "left"} wins`);
			// this.winner = this.model.upd.turn ? this.player_1 : this.player_2;
		}
		this.gameEndMessage.classList.add('show');
		this.saveGameResult(roomName, this.winner, this.model.upd.draw)

		setTimeout(() => {
			this.gameEndMessage.classList.remove('show');
		}, 2000);
	}

	showInstructions(show) {
		this.instuctions.innerText = `Each player has 2 sets of 3 rings,
		each with different sizes.

		Players can place a larger ring over a smaller one.
		The color of the largest ring on a cell
		determines control of that cell.

		The main goal is to align 3 of your
		colored rings in a row:
		horizontally, vertically, or diagonally.`;

		this.instuctions.classList.toggle('show', show);
	}

	saveGameResult(roomName, winner, draw) {
		// console.log(`/tictac/${roomName}/save-result/`);
		// console.log(`player1 ${player1}`);
		fetch(`/tictac/${roomName}/save-result/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': '{{ csrf_token }}',
			},
			body: JSON.stringify({
				winner: winner,
				is_draw: draw,
			})
		})
		.then(response => response.json())
		.then(data => {
			if (data.status === 'success') {
				console.log('Game result saved');
			} else {
				console.error('Failed to save result:', data.message);
			}
		})
		.catch(error => console.error('Error saving game result:', error));
	}
}

const game = new TicTacToeController(new TicTacToeModel(), new TicTacToeView());

// /*
// Flow:
// The Controller listens for click events on the board (from the View).
// When a click happens, the controller places a ring in the model.
// The model checks if the move is valid and updates the game state.
// After any changes to the game state, the controller asks the View to re-render the board.
// */
