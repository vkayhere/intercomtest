let timer;
let seconds = 0;
let gameStarted = false;
let originalBoard = [];
let solution = [];
let hintsUsed = 0;
const MAX_HINTS = 3; // Maximum number of hints allowed per game

// Generate a valid Sudoku solution
function generateSolution() {
    const basePattern = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 1, 4, 3, 6, 5, 8, 9, 7],
        [3, 6, 5, 8, 9, 7, 2, 1, 4],
        [8, 9, 7, 2, 1, 4, 3, 6, 5],
        [5, 3, 1, 6, 4, 2, 9, 7, 8],
        [6, 4, 2, 9, 7, 8, 5, 3, 1],
        [9, 7, 8, 5, 3, 1, 6, 4, 2]
    ];
    return basePattern;
}

// Generate an easy puzzle from the solution
function generatePuzzle() {
    // First, get a complete solution
    solution = generateSolution();
    
    // Create a copy for the puzzle
    let puzzle = solution.map(row => [...row]);
    
    // Define positions to keep (for an easy puzzle, we'll keep around 35-40 numbers)
    const cellsToRemove = 45; // This will leave 36 numbers (81 - 45 = 36)
    
    // Remove numbers randomly
    let removed = 0;
    while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            removed++;
        }
    }
    
    return puzzle;
}

function isValid(board, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
    }
    
    // Check 3x3 box
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i + startRow][j + startCol] === num) return false;
        }
    }
    
    return true;
}

function createBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    const puzzle = generatePuzzle();
    originalBoard = JSON.parse(JSON.stringify(puzzle));

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            if (puzzle[i][j] !== 0) {
                cell.textContent = puzzle[i][j];
                cell.classList.add('given');
            } else {
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '1';
                input.max = '9';
                input.addEventListener('input', (e) => {
                    // Validate input
                    if (e.target.value && (e.target.value < 1 || e.target.value > 9)) {
                        e.target.value = '';
                    }
                    checkWin();
                });
                cell.appendChild(input);
            }
            
            board.appendChild(cell);
        }
    }
}

function updateTimer() {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    seconds = 0;
    hintsUsed = 0;
    createBoard();
    timer = setInterval(updateTimer, 1000);
    document.getElementById('start-btn').textContent = 'Game in Progress';
    document.getElementById('hint-btn').disabled = false;
    document.getElementById('message').textContent = '';
}

function getHint() {
    if (!gameStarted || hintsUsed >= MAX_HINTS) return;

    // Find an empty cell or incorrect number
    const cells = document.querySelectorAll('.cell');
    const emptyCells = Array.from(cells).filter(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const input = cell.querySelector('input');
        
        if (!input) return false; // Skip given numbers
        
        const currentValue = input.value ? parseInt(input.value) : 0;
        return currentValue !== solution[row][col];
    });

    if (emptyCells.length === 0) return;

    // Randomly select an empty cell
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const row = parseInt(randomCell.dataset.row);
    const col = parseInt(randomCell.dataset.col);
    
    // Fill in the correct number
    const input = randomCell.querySelector('input');
    input.value = solution[row][col];
    input.classList.add('hinted');
    
    hintsUsed++;
    
    // Update hint button status
    const hintBtn = document.getElementById('hint-btn');
    hintBtn.textContent = `Get Hint (${MAX_HINTS - hintsUsed} left)`;
    if (hintsUsed >= MAX_HINTS) {
        hintBtn.disabled = true;
    }

    // Check if puzzle is solved
    checkWin();
}

function checkWin() {
    const cells = document.querySelectorAll('.cell');
    let complete = true;
    
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const input = cell.querySelector('input');
        
        if (input) {
            const value = input.value ? parseInt(input.value) : 0;
            if (!value || value !== solution[row][col]) {
                complete = false;
            }
        }
    });
    
    if (complete) {
        clearInterval(timer);
        gameStarted = false;
        document.getElementById('start-btn').textContent = 'Play Again';
        document.getElementById('hint-btn').disabled = true;
        document.getElementById('message').textContent = 
            `Congratulations! You solved the puzzle! (${hintsUsed} hints used)`;
        
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('hint-btn').addEventListener('click', getHint); 