const board = document.getElementById('board');
const cells = document.querySelectorAll('[data-cell]');
const message = document.getElementById('message');
const restartButton = document.getElementById('restartButton');

const PLAYER_X = 'x';
const COMPUTER_O = 'o';

let gameActive = true;

const snarkyMessages = [
    "Ha! Better luck next time, human!",
    "Robots: 1, Humans: 0. Just saying...",
    "Did you even try?",
    "Maybe stick to rock, paper, scissors?",
    "AI supremacy confirmed!",
    "Was that your best move? Really?",
    "Even a random number generator could do better!"
];

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

startGame();

function startGame() {
    gameActive = true;
    cells.forEach(cell => {
        cell.classList.remove(PLAYER_X);
        cell.classList.remove(COMPUTER_O);
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    message.textContent = "Your turn! (X)";
}

function handleClick(e) {
    if (!gameActive) return;

    const cell = e.target;
    if (cell.classList.contains(PLAYER_X) || cell.classList.contains(COMPUTER_O)) return;

    // Player's move
    cell.classList.add(PLAYER_X);

    if (checkWin(PLAYER_X)) {
        endGame(true);
        return;
    }

    if (isDraw()) {
        endGame(false);
        return;
    }

    // Computer's move
    gameActive = false;
    message.textContent = "Computer is thinking...";
    
    setTimeout(() => {
        computerMove();
        
        if (checkWin(COMPUTER_O)) {
            endGame(false);
            return;
        }

        if (isDraw()) {
            endGame(false);
            return;
        }

        gameActive = true;
        message.textContent = "Your turn! (X)";
    }, 500);
}

function computerMove() {
    // Try to win
    const winningMove = findBestMove(COMPUTER_O);
    if (winningMove !== -1) {
        cells[winningMove].classList.add(COMPUTER_O);
        return;
    }

    // Block player's winning move
    const blockingMove = findBestMove(PLAYER_X);
    if (blockingMove !== -1) {
        cells[blockingMove].classList.add(COMPUTER_O);
        return;
    }

    // Take center if available
    if (!cells[4].classList.contains(PLAYER_X) && !cells[4].classList.contains(COMPUTER_O)) {
        cells[4].classList.add(COMPUTER_O);
        return;
    }

    // Take random available cell
    const availableCells = [...cells].filter(
        cell => !cell.classList.contains(PLAYER_X) && !cell.classList.contains(COMPUTER_O)
    );
    const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
    randomCell.classList.add(COMPUTER_O);
}

function findBestMove(player) {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        const cellsInCombo = [cells[a], cells[b], cells[c]];
        
        const playerCells = cellsInCombo.filter(cell => cell.classList.contains(player));
        const emptyCells = cellsInCombo.filter(cell => 
            !cell.classList.contains(PLAYER_X) && !cell.classList.contains(COMPUTER_O)
        );

        if (playerCells.length === 2 && emptyCells.length === 1) {
            return combination[cellsInCombo.indexOf(emptyCells[0])];
        }
    }
    return -1;
}

function checkWin(player) {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return cells[index].classList.contains(player);
        });
    });
}

function isDraw() {
    return [...cells].every(cell => {
        return cell.classList.contains(PLAYER_X) || cell.classList.contains(COMPUTER_O);
    });
}

function endGame(playerWon) {
    gameActive = false;
    if (playerWon) {
        message.textContent = "Congratulations! You won!";
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    } else if (isDraw()) {
        message.textContent = "It's a draw!";
    } else {
        message.textContent = snarkyMessages[Math.floor(Math.random() * snarkyMessages.length)];
    }
}

restartButton.addEventListener('click', startGame); 