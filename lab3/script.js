// инициализация состояния
let board = [];
let score = 0;
const boardSize = 4;
const tileContainer = document.getElementById('tile-container');
const scoreElement = document.getElementById('score');

// логика игры
function startNewGame() {
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    score = 0;
    addRandomTile();
    addRandomTile();
    // с вероятностью 50% добавим третью плитку
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
    board[r][c] = Math.random() < 0.9 ? 2 : 4; // 90% - 2, 10% - 4
    return true;
}

function renderBoard() {
    // очищаем контейнер плиток
    tileContainer.innerHTML = '';

    const cellSize = tileContainer.clientWidth / boardSize;
    const gap = 15; // такое же как в CSS, но лучше получать вычисленное значение

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
    tile.style.height = (cellSize - gap) + 'px'; // чтобы сохранить квадрат

    tileContainer.appendChild(tile);
}

// при изменении размера окна перерисовываем плитки (для корректного позиционирования)
window.addEventListener('resize', () => {
    renderBoard();
});

// запуск игры
startNewGame();