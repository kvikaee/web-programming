document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    // состояние приложения
    let tasks = []; // массив задач

    // DOM-элементы (получим после создания)
    let tasksContainer;

    // вспомогательные функции
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const saved = localStorage.getItem('tasks');
        if (saved) {
            tasks = JSON.parse(saved);
        } else {
            tasks = []; // пустой массив, без демо-задач
        }
    }

    // создание DOM-структуры (добавляем ссылки на элементы)
    function buildUI() {
        // заголовок
        const title = document.createElement('h1');
        title.textContent = 'To-Do List';
        app.appendChild(title);

        // форма добавления задачи
        const addForm = document.createElement('form');
        addForm.className = 'add-form';

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.placeholder = 'Название задачи';
        titleInput.required = true;
        titleInput.id = 'task-title';

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.id = 'task-date';
        // устанавливаем сегодняшнюю дату по умолчанию
        dateInput.value = new Date().toISOString().split('T')[0];

        const addButton = document.createElement('button');
        addButton.type = 'submit';
        addButton.textContent = 'Добавить';

        addForm.appendChild(titleInput);
        addForm.appendChild(dateInput);
        addForm.appendChild(addButton);
        app.appendChild(addForm);

        // панель управления
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

        
        const sortButton = document.createElement('button');
        sortButton.textContent = 'Сортировать по дате (возр.)';
        controls.appendChild(sortButton);

        app.appendChild(controls);

        // контейнер для задач
        tasksContainer = document.createElement('div');
        tasksContainer.id = 'tasks-container';
        tasksContainer.className = 'tasks-container';
        app.appendChild(tasksContainer);

        // обработчик добавления задачи
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = titleInput.value.trim();
            const date = dateInput.value;
            if (!title || !date) return;

            const newTask = {
                id: Date.now(), // уникальный идентификатор
                title,
                date,
                completed: false
            };
            tasks.push(newTask);
            saveTasks();
            renderTasks(); // отрисовываем обновлённый список

            // очищаем форму
            titleInput.value = '';
            dateInput.value = new Date().toISOString().split('T')[0];
        });
    }

    // функция отрисовки задач
    function renderTasks() {
        tasksContainer.innerHTML = ''; // очищаем контейнер

        if (tasks.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = 'Нет задач';
            tasksContainer.appendChild(emptyMsg);
            return;
        }

        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            tasksContainer.appendChild(taskElement);
        });
    }

    // создание DOM-элемента одной задачи
    function createTaskElement(task) {
        const item = document.createElement('div');
        item.className = `task-item ${task.completed ? 'completed' : ''}`;
        item.dataset.id = task.id;

        // чекбокс для отметки выполнения
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        // позже добавить обработчик

        // информация о задаче
        const infoDiv = document.createElement('div');
        infoDiv.className = 'task-info';
        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title';
        titleSpan.textContent = task.title;
        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date';
        dateSpan.textContent = task.date;
        infoDiv.appendChild(titleSpan);
        infoDiv.appendChild(dateSpan);

        // кнопки действий
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Ред.';
        // позже добавим обработчик

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        // позже добавим обработчик

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        item.appendChild(checkbox);
        item.appendChild(infoDiv);
        item.appendChild(actionsDiv);

        return item;
    }

    // инициализация
    function init() {
        buildUI();
        loadTasks();
        renderTasks();
    }

    init();
});