// состояние
let board = [];
let score = 0;
let history = []; // для undo (пока не используется)
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

// LocalStorage для лидерборда
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
    renderBoard();
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
    board[r][c] = Math.random() < 0.9 ? 2 : 4; // 90% - 2, 10% - 4
    return true;
}

function move(direction) {
    if (gameOver) return false;

    // сохраняем состояние для undo (пока не используем, но сохраняем)
    history.push({
        board: board.map(row => [...row]),
        score
    });

    let moved = false;
    let addedScore = 0;

    // вспомогательная функция обработки линии (массива из 4 элементов)
    function processLine(line) {
        // убираем нули
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
        // дополняем нулями до размера 4
        while (newLine.length < boardSize) newLine.push(0);
        return newLine;
    }

    // обработка каждого направления
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

        // Проверяем, не закончилась ли игра
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
    // очищаем контейнер плиток
    tileContainer.innerHTML = '';

    // Вычисляем размер ячейки с учётом отступов
    const cellSize = tileContainer.clientWidth / boardSize;
    const gap = 15; // должно совпадать со значением в CSS

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

// модальные окна
function showGameOverModal() {
    finalScoreSpan.textContent = score;
    gameOverMessage.textContent = `Ваш счёт: ${score}`;
    nameInputGroup.style.display = 'flex';
    playerNameInput.value = '';
    gameOverModal.style.display = 'flex';
    mobileControls.style.display = 'none'; // скрываем мобильные кнопки
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
    // сортируем по убыванию счёта и берём топ-10
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

    // меняем сообщение и скрываем инпут
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
    alert('Отмена пока не реализована');
});

// кнопка "Лидеры"
document.getElementById('show-leaderboard').addEventListener('click', () => {
    showLeaderboardModal();
});

// закрытие модалки лидеров
document.getElementById('close-leaderboard').addEventListener('click', () => {
    hideLeaderboardModal();
});

// кнопка "Начать заново" в модалке окончания
document.getElementById('restart-from-modal').addEventListener('click', () => {
    startNewGame();
    hideGameOverModal();
});

// кнопка "Сохранить" в модалке окончания
document.getElementById('save-score').addEventListener('click', () => {
    saveScore();
});

// кнопка "Закрыть" в модалке окончания
document.getElementById('close-modal').addEventListener('click', () => {
    hideGameOverModal();
});

// закрытие модалок по клику на фон
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            if (overlay.id === 'game-over-modal') hideGameOverModal();
            else if (overlay.id === 'leaderboard-modal') hideLeaderboardModal();
        }
    });
});

// при изменении размера окна перерисовываем плитки и корректируем видимость мобильных кнопок
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

// запуск игры
startNewGame();