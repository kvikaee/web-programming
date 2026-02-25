// состояние
let board = [];
let score = 0;
let history = []; // для undo (пока не используется)
let gameOver = false; // пока не используется

const boardSize = 4;
const tileContainer = document.getElementById('tile-container');
const scoreElement = document.getElementById('score');

// логика игры
function startNewGame() {
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    score = 0;
    history = [];
    gameOver = false;
    addRandomTile();
    addRandomTile();
    if (Math.random() < 0.5) addRandomTile();
    renderBoard();
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

    // сохраняем состояние для undo (пока не используем)
    history.push({
        board: board.map(row => [...row]),
        score
    });

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
        addRandomTile(); // добавляем одну плитку
        // с вероятностью 50% добавляем вторую
        if (Math.random() < 0.5) addRandomTile();
        renderBoard();
    } else {
        // если ход не удался, убираем из истории
        history.pop();
    }
    return moved;
}

function renderBoard() {
    tileContainer.innerHTML = '';

    const cellSize = tileContainer.clientWidth / boardSize;
    const gap = 15; // должно соответствовать CSS

    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            const value = board[r][c];
            if (value !== 0) {
                createTile(r, c, value);
            }
        }
    }
    scoreElement.textContent = score;
}

function createTile(row, col, value) {
    const tile = document.createElement('div');
    tile.className = 'tile';
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

// кнопки управления (мобильные)
document.querySelectorAll('.move-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (gameOver) return;
        const direction = btn.dataset.direction;
        move(direction);
    });
});

// кнопка "Новая игра"
document.getElementById('new-game').addEventListener('click', () => {
    startNewGame();
});

// кнопка "Отмена" пока не работает
document.getElementById('undo').addEventListener('click', () => {
    // будет позже
    alert('Отмена пока не реализована');
});

// кнопка "Лидеры" пока не работает
document.getElementById('show-leaderboard').addEventListener('click', () => {
    alert('Таблица лидеров будет позже');
});

window.addEventListener('resize', () => {
    renderBoard();
});

startNewGame();