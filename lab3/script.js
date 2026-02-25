// script.js

// получаем ссылки на все необходимые элементы dom
// const boardElement = document.getElementById('board');
// const scoreElement = document.getElementById('score');
const newGameBtn = document.getElementById('new-game');
const undoBtn = document.getElementById('undo');
const showLeaderboardBtn = document.getElementById('show-leaderboard');
const gameOverModal = document.getElementById('game-over-modal');
const leaderboardModal = document.getElementById('leaderboard-modal');
// const playerNameInput = document.getElementById('player-name');
const saveScoreBtn = document.getElementById('save-score');
const restartFromModalBtn = document.getElementById('restart-from-modal');
const closeLeaderboardBtn = document.getElementById('close-leaderboard');
// const mobileControls = document.getElementById('mobile-controls');
const moveUpBtn = document.getElementById('move-up');
const moveLeftBtn = document.getElementById('move-left');
const moveDownBtn = document.getElementById('move-down');
const moveRightBtn = document.getElementById('move-right');

// пустые обработчики (заглушки) – на этом этапе они просто логируют или ничего не делают
newGameBtn.addEventListener('click', () => {
    console.log('новая игра');
});

undoBtn.addEventListener('click', () => {
    console.log('отмена хода');
});

showLeaderboardBtn.addEventListener('click', () => {
    console.log('показать лидеров');
    leaderboardModal.style.display = 'flex';
});

closeLeaderboardBtn.addEventListener('click', () => {
    leaderboardModal.style.display = 'none';
});

saveScoreBtn.addEventListener('click', () => {
    console.log('сохранить результат');
    // здесь позже будет логика сохранения
});

restartFromModalBtn.addEventListener('click', () => {
    console.log('начать заново из модалки');
    gameOverModal.style.display = 'none';
});

// закрытие модалки при клике на фон (просто для удобства)
window.addEventListener('click', (e) => {
    if (e.target === gameOverModal) {
        gameOverModal.style.display = 'none';
    }
    if (e.target === leaderboardModal) {
        leaderboardModal.style.display = 'none';
    }
});

// мобильные кнопки – заглушки
moveUpBtn.addEventListener('click', () => console.log('вверх'));
moveLeftBtn.addEventListener('click', () => console.log('влево'));
moveDownBtn.addEventListener('click', () => console.log('вниз'));
moveRightBtn.addEventListener('click', () => console.log('вправо'));

// для демонстрации можно раскомментировать:
// gameOverModal.style.display = 'flex';