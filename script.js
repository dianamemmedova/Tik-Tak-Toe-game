var symbolMap = {
    classic: {
        X: 'X',
        O: 'O'
    },
    firewater: {
        X: '🔥',
        O: '💧'
    },
    nature: {
        X: '🌿',
        O: '🌳'
    },
    candy: {
        X: '🍭',
        O: '🍬'
    },
    tech: {
        X: '⚡',
        O: '💎'
    }
};

var board = [null, null, null, null, null, null, null, null, null];
var isXNext = true;
var gameMode = null;
var winner = null;
var scores = {
    X: 0,
    O: 0,
    draw: 0
};
var theme = 'light';
var boardStyle = 'classic';
var playerSymbol = 'X';
var difficulty = 'medium';

function toggleSettings() {
    var panel = document.getElementById('settings-panel');
    panel.classList.toggle('active');
}

function changeTheme(newTheme, element) {
    theme = newTheme;
    document.body.className = 'theme-' + newTheme;
    var buttons = element.parentElement.querySelectorAll('.option-btn');
    for (var i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');
    element.classList.add('active');
}

function changeStyle(style, element) {
    boardStyle = style;
    var buttons = element.parentElement.querySelectorAll('.option-btn');
    for (var i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');
    element.classList.add('active');
    if (gameMode) {
        updateBoard();
        updateScores();
        updateStatus();
    }
}

function changePlayer(symbol, element) {
    playerSymbol = symbol;
    var buttons = element.parentElement.querySelectorAll('.option-btn');
    for (var i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');
    element.classList.add('active');
}

function changeDifficulty(diff, element) {
    difficulty = diff;
    var buttons = element.parentElement.querySelectorAll('.option-btn');
    for (var i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');
    element.classList.add('active');
}

function startGame(mode) {
    gameMode = mode;
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    createBoard();
    updateScores();
}

function backToMenu() {
    gameMode = null;
    board = [null, null, null, null, null, null, null, null, null];
    isXNext = true;
    winner = null;
    scores = {
        X: 0,
        O: 0,
        draw: 0
    };
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('menu-screen').classList.remove('hidden');
}

function createBoard() {
    var boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    for (var i = 0; i < 9; i++) {
        var square = document.createElement('div');
        square.className = 'square';
        square.onclick = (function (idx) {
            return function () {
                handleClick(idx);
            };
        })(i);
        boardEl.appendChild(square);
    }
    updateBoard();
}

function handleClick(i) {
    if (board[i] || winner) return;
    board[i] = isXNext ? 'X' : 'O';
    isXNext = !isXNext;
    checkWinner();
    updateBoard();
    if (gameMode === 'computer' && !winner) {
        var shouldMove = (playerSymbol === 'X' && !isXNext) || (playerSymbol === 'O' && isXNext);
        if (shouldMove) setTimeout(makeComputerMove, 500);
    }
}

function makeComputerMove() {
    var emptySquares = [];
    for (var i = 0; i < board.length; i++) {
        if (board[i] === null) emptySquares.push(i);
    }
    if (emptySquares.length === 0) return;
    var computerSymbol = playerSymbol === 'X' ? 'O' : 'X';
    var move;
    if (difficulty === 'easy') {
        move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    } else if (difficulty === 'medium') {
        move = findBestMove(computerSymbol);
        if (move === null) move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    } else {
        move = findBestMoveHard(computerSymbol);
        if (move === null) move = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }
    handleClick(move);
}

function findBestMove(player) {
    var opponent = player === 'X' ? 'O' : 'X';
    for (var i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = player;
            if (checkWinnerForBoard(board)) {
                board[i] = null;
                return i;
            }
            board[i] = null;
        }
    }
    for (var i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = opponent;
            if (checkWinnerForBoard(board)) {
                board[i] = null;
                return i;
            }
            board[i] = null;
        }
    }
    if (board[4] === null) return 4;
    return null;
}

function findBestMoveHard(player) {
    var move = findBestMove(player);
    if (move !== null) return move;
    var corners = [0, 2, 6, 8];
    var availableCorners = [];
    for (var i = 0; i < corners.length; i++) {
        if (board[corners[i]] === null) availableCorners.push(corners[i]);
    }
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    var sides = [1, 3, 5, 7];
    var availableSides = [];
    for (var i = 0; i < sides.length; i++) {
        if (board[sides[i]] === null) availableSides.push(sides[i]);
    }
    if (availableSides.length > 0) {
        return availableSides[Math.floor(Math.random() * availableSides.length)];
    }
    return null;
}

function checkWinner() {
    var result = checkWinnerForBoard(board);
    if (result) {
        winner = result.winner;
        scores[winner]++;
        updateScores();
        highlightWinningLine(result.line);
    } else {
        var allFilled = true;
        for (var i = 0; i < board.length; i++) {
            if (board[i] === null) {
                allFilled = false;
                break;
            }
        }
        if (allFilled) {
            winner = 'draw';
            scores.draw++;
            updateScores();
        }
    }
}

function checkWinnerForBoard(squares) {
    var lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (squares[line[0]] && squares[line[0]] === squares[line[1]] && squares[line[0]] === squares[line[2]]) {
            return {
                winner: squares[line[0]],
                line: line
            };
        }
    }
    return null;
}

function highlightWinningLine(line) {
    var squares = document.getElementById('board').children;
    for (var j = 0; j < squares.length; j++) squares[j].classList.remove('win');
    for (var i = 0; i < line.length; i++) squares[line[i]].classList.add('win');
}

function updateBoard() {
    var squares = document.getElementById('board').children;
    for (var i = 0; i < 9; i++) {
        var square = squares[i];
        var value = board[i];
        square.className = 'square';
        square.textContent = '';
        if (value) {
            var symbolClass = 'symbol-' + value.toLowerCase() + '-' + boardStyle;
            square.classList.add('filled', symbolClass);
            square.textContent = symbolMap[boardStyle][value];
            if (winner && winner !== 'draw') {
                var winResult = checkWinnerForBoard(board);
                if (winResult) {
                    for (var j = 0; j < winResult.line.length; j++) {
                        if (winResult.line[j] === i) {
                            square.classList.add('win');
                            break;
                        }
                    }
                }
            }
        }
    }
    updateStatus();
}

function updateStatus() {
    var statusEl = document.getElementById('status');
    if (winner) {
        if (winner === 'draw') {
            statusEl.textContent = 'Heç-heçə! 🤝';
        } else {
            statusEl.textContent = symbolMap[boardStyle][winner] + ' qalib gəldi! 🎉';
        }
    } else {
        var currentPlayer = isXNext ? 'X' : 'O';
        statusEl.textContent = 'Növbə: ' + symbolMap[boardStyle][currentPlayer];
    }
}

function updateScores() {
    document.getElementById('score-x').textContent = symbolMap[boardStyle]['X'] + ': ' + scores.X;
    document.getElementById('score-o').textContent = symbolMap[boardStyle]['O'] + ': ' + scores.O;
    document.getElementById('score-draw').textContent = scores.draw;
}

function newGame() {
    board = [null, null, null, null, null, null, null, null, null];
    isXNext = true;
    winner = null;
    createBoard();
    if (gameMode === 'computer') {
        var computerSymbol = playerSymbol === 'X' ? 'O' : 'X';
        var computerStarts = (computerSymbol === 'X' && isXNext) || (computerSymbol === 'O' && !isXNext);
        if (computerStarts) setTimeout(makeComputerMove, 500);
    }
}