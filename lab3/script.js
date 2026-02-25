let board = [];
let prevBoard = []; // для сравнения при анимациях
let score = 0;
let history = [];
let gameOver = false;

const boardSize = 4;
const tileContainer = document.getElementById('tile-container');
const scoreElement = document.getElementById('score');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreSpan = document.getElementById('final-score');
const playerNameInput = document.getElementById('player-name');
const nameInputGroup = document.getElementById('name-input-group');
const gameOverMessage = document.getElementById('game-over-message');
const leaderboardModal = document.getElementById('leaderboard-modal');
const leaderboardBody = document.getElementById('leaderboard-body');
const mobileControls = document.getElementById('mobile-controls');

// LocalStorage
function saveGame() {
    const state = {
        board,
        score,
        history
    };
    localStorage.setItem('game2048', JSON.stringify(state));
}

function loadGame() {
    const saved = localStorage.getItem('game2048');
    if (saved) {
        const state = JSON.parse(saved);
        board = state.board;
        score = state.score;
        history = state.history || [];
        prevBoard = board.map(row => [...row]);
        renderBoard();
    } else {
        startNewGame();
    }
}

function loadLeaderboard() {
    const saved = localStorage.getItem('leaderboard2048');
    return saved ? JSON.parse(saved) : [];
}

function saveLeaderboard(leaderboard) {
    localStorage.setItem('leaderboard2048', JSON.stringify(leaderboard));
}

// логика игры
function startNewGame() {
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    score = 0;
    history = [];
    gameOver = false;
    addRandomTile();
    addRandomTile();
    if (Math.random() < 0.5) addRandomTile();
    prevBoard = board.map(row => [...row]);
    renderBoard();
    saveGame();
    hideGameOverModal();
}

function addRandomTile() {
    const empty = [];
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c] === 0) empty.push({ r, c });
        }
    }
    if (empty.length === 0) return false;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    board[r][c] = Math.random() < 0.9 ? 2 : 4;
    return true;
}

function move(direction) {
    if (gameOver) return false;

    // сохраняем состояние для undo
    history.push({
        board: board.map(row => [...row]),
        score
    });
    if (history.length > 10) history.shift();

    // сохраняем предыдущее состояние для анимаций
    prevBoard = board.map(row => [...row]);

    let moved = false;
    let addedScore = 0;

    function processLine(line) {
        const filtered = line.filter(v => v !== 0);
        const newLine = [];
        let i = 0;
        while (i < filtered.length) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                newLine.push(filtered[i] * 2);
                addedScore += filtered[i] * 2;
                i += 2;
            } else {
                newLine.push(filtered[i]);
                i++;
            }
        }
        while (newLine.length < boardSize) newLine.push(0);
        return newLine;
    }

    if (direction === 'left') {
        for (let r = 0; r < boardSize; r++) {
            const original = board[r].slice();
            const processed = processLine(board[r]);
            if (processed.join() !== original.join()) {
                moved = true;
                board[r] = processed;
            }
        }
    } else if (direction === 'right') {
        for (let r = 0; r < boardSize; r++) {
            const original = board[r].slice();
            const reversed = board[r].slice().reverse();
            const processed = processLine(reversed).reverse();
            if (processed.join() !== original.join()) {
                moved = true;
                board[r] = processed;
            }
        }
    } else if (direction === 'up') {
        for (let c = 0; c < boardSize; c++) {
            const column = board.map(row => row[c]);
            const original = column.slice();
            const processed = processLine(column);
            if (processed.join() !== original.join()) {
                moved = true;
                for (let r = 0; r < boardSize; r++) {
                    board[r][c] = processed[r];
                }
            }
        }
    } else if (direction === 'down') {
        for (let c = 0; c < boardSize; c++) {
            const column = board.map(row => row[c]).reverse();
            const original = column.slice();
            const processed = processLine(column).reverse();
            if (processed.join() !== original.join()) {
                moved = true;
                for (let r = 0; r < boardSize; r++) {
                    board[r][c] = processed[r];
                }
            }
        }
    }

    if (moved) {
        score += addedScore;
        addRandomTile();
        if (Math.random() < 0.5) addRandomTile();
        renderBoard();
        saveGame();

        if (isGameOver()) {
            gameOver = true;
            showGameOverModal();
        }
    } else {
        // если ход не удался, убираем из истории
        history.pop();
    }
    return moved;
}

function undo() {
    if (gameOver) return;
    if (history.length === 0) return;
    const prev = history.pop();
    board = prev.board.map(row => [...row]);
    score = prev.score;
    prevBoard = board.map(row => [...row]); // сбрасываем предыдущее для анимаций
    renderBoard();
    saveGame();
}

function isGameOver() {
    // проверка на пустые клетки
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c] === 0) return false;
        }
    }
    // проверка на возможность слияния по горизонтали
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize - 1; c++) {
            if (board[r][c] === board[r][c + 1]) return false;
        }
    }
    // проверка по вертикали
    for (let c = 0; c < boardSize; c++) {
        for (let r = 0; r < boardSize - 1; r++) {
            if (board[r][c] === board[r + 1][c]) return false;
        }
    }
    return true;
}

function renderBoard() {
    tileContainer.innerHTML = '';

    const cellSize = tileContainer.clientWidth / boardSize;
    const gap = 15;

    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            const value = board[r][c];
            if (value !== 0) {
                // определяем, является ли плитка новой или слитой
                let isNew = false;
                let isMerged = false;

                // если в предыдущем состоянии на этом месте было 0, то плитка новая
                if (prevBoard[r] && prevBoard[r][c] === 0) {
                    isNew = true;
                }
  
                if (!isNew && prevBoard[r] && prevBoard[r][c] !== 0 && prevBoard[r][c] !== value) {
                    // значение изменилось, вероятно, слияние
                    isMerged = true;
                }

                createTile(r, c, value, isNew, isMerged);
            }
        }
    }
    scoreElement.textContent = score;

    // обновляем prevBoard для следующего хода
    prevBoard = board.map(row => [...row]);
}

function createTile(row, col, value, isNew = false, isMerged = false) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    if (isNew) tile.classList.add('new-tile');
    if (isMerged) tile.classList.add('merged');
    tile.setAttribute('data-value', value);
    tile.textContent = value;

    const cellSize = tileContainer.clientWidth / boardSize;
    const gap = 15;

    const left = col * cellSize + (col * gap) / boardSize;
    const top = row * cellSize + (row * gap) / boardSize;
    tile.style.left = left + 'px';
    tile.style.top = top + 'px';
    tile.style.width = (cellSize - gap) + 'px';
    tile.style.height = (cellSize - gap) + 'px';

    tileContainer.appendChild(tile);

    // убираем классы анимации через 200ms, чтобы они не оставались
    setTimeout(() => {
        tile.classList.remove('new-tile', 'merged');
    }, 200);
}

// модальные окна
function showGameOverModal() {
    finalScoreSpan.textContent = score;
    gameOverMessage.textContent = `Ваш счёт: ${score}`;
    nameInputGroup.style.display = 'flex';
    playerNameInput.value = '';
    gameOverModal.style.display = 'flex';
    mobileControls.style.display = 'none';
}

function hideGameOverModal() {
    gameOverModal.style.display = 'none';
    if (window.innerWidth <= 480) {
        mobileControls.style.display = 'flex';
    }
}

function showLeaderboardModal() {
    updateLeaderboardTable();
    leaderboardModal.style.display = 'flex';
    mobileControls.style.display = 'none';
}

function hideLeaderboardModal() {
    leaderboardModal.style.display = 'none';
    if (window.innerWidth <= 480 && !gameOver) {
        mobileControls.style.display = 'flex';
    }
}

function updateLeaderboardTable() {
    const leaderboard = loadLeaderboard();
    const top10 = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
    leaderboardBody.innerHTML = '';
    top10.forEach(entry => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        nameCell.textContent = entry.name;
        const scoreCell = document.createElement('td');
        scoreCell.textContent = entry.score;
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(entry.date).toLocaleDateString();
        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        row.appendChild(dateCell);
        leaderboardBody.appendChild(row);
    });
}

function saveScore() {
    const name = playerNameInput.value.trim();
    if (!name) {
        alert('Введите имя');
        return;
    }
    const leaderboard = loadLeaderboard();
    leaderboard.push({
        name,
        score,
        date: new Date().toISOString()
    });
    saveLeaderboard(leaderboard);

    nameInputGroup.style.display = 'none';
    gameOverMessage.textContent = 'Ваш рекорд сохранен!';
}

// обработчики событий
document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    const key = e.key;
    if (key.startsWith('Arrow')) {
        e.preventDefault();
        const direction = key.slice(5).toLowerCase();
        move(direction);
    }
});

document.querySelectorAll('.move-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (gameOver) return;
        const direction = btn.dataset.direction;
        move(direction);
    });
});

document.getElementById('new-game').addEventListener('click', () => {
    startNewGame();
});

document.getElementById('undo').addEventListener('click', () => {
    undo();
});

document.getElementById('show-leaderboard').addEventListener('click', () => {
    showLeaderboardModal();
});

document.getElementById('close-leaderboard').addEventListener('click', () => {
    hideLeaderboardModal();
});

document.getElementById('restart-from-modal').addEventListener('click', () => {
    startNewGame();
    hideGameOverModal();
});

document.getElementById('save-score').addEventListener('click', () => {
    saveScore();
});

document.getElementById('close-modal').addEventListener('click', () => {
    hideGameOverModal();
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            if (overlay.id === 'game-over-modal') hideGameOverModal();
            else if (overlay.id === 'leaderboard-modal') hideLeaderboardModal();
        }
    });
});

window.addEventListener('resize', () => {
    renderBoard();
    if (window.innerWidth > 480) {
        mobileControls.style.display = 'none';
    } else {
        if (!gameOver && getComputedStyle(gameOverModal).display === 'none' && getComputedStyle(leaderboardModal).display === 'none') {
            mobileControls.style.display = 'flex';
        } else {
            mobileControls.style.display = 'none';
        }
    }
});

loadGame();