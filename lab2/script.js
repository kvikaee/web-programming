document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    // создание базовых элементов
    function buildUI() {
        // заголовок
        const title = document.createElement('h1');
        title.textContent = 'To-Do List';
        app.appendChild(title);

        // форма добавления задачи (без логики)
        const addForm = document.createElement('form');
        addForm.className = 'add-form';

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.placeholder = 'Название задачи';
        titleInput.required = true;

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.value = new Date().toISOString().split('T')[0];

        const addButton = document.createElement('button');
        addButton.type = 'submit';
        addButton.textContent = 'Добавить';

        addForm.appendChild(titleInput);
        addForm.appendChild(dateInput);
        addForm.appendChild(addButton);
        app.appendChild(addForm);

        // панель управления (фильтр, поиск, сортировка)
        const controls = document.createElement('div');
        controls.className = 'controls';

        // фильтр по статусу
        const filterSelect = document.createElement('select');
        ['all', 'active', 'completed'].forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value === 'all' ? 'Все' : value === 'active' ? 'Активные' : 'Выполненные';
            filterSelect.appendChild(option);
        });
        controls.appendChild(filterSelect);

        // поиск
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Поиск по названию...';
        controls.appendChild(searchInput);

        // кнопка сортировки
        const sortButton = document.createElement('button');
        sortButton.textContent = 'Сортировать по дате (возр.)';
        controls.appendChild(sortButton);

        app.appendChild(controls);

        // контейнер для задач
        const tasksContainer = document.createElement('div');
        tasksContainer.id = 'tasks-container';
        tasksContainer.className = 'tasks-container';
        app.appendChild(tasksContainer);
    }

    buildUI();
});