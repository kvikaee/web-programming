document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    let tasks = [];
    let filterStatus = 'all';
    let searchQuery = '';
    let sortOrder = 'asc';
    let dragSourceId = null;

    let tasksContainer;
    let filterSelect;
    let searchInput;
    let sortButton;

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const saved = localStorage.getItem('tasks');
        if (saved) {
            tasks = JSON.parse(saved);
        } else {
            tasks = [];
        }
    }

    // --- Фильтрация и сортировка ---
    function getFilteredAndSortedTasks() {
        let filtered = tasks.filter(task => {
            if (filterStatus === 'active' && task.completed) return false;
            if (filterStatus === 'completed' && !task.completed) return false;
            if (searchQuery && !task.title.toLowerCase().includes(searchQuery)) return false;
            return true;
        });

        filtered.sort((a, b) => {
            if (sortOrder === 'asc') return a.date.localeCompare(b.date);
            else return b.date.localeCompare(a.date);
        });

        return filtered;
    }

    // построение интерфейса
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
        filterSelect = document.createElement('select');
        ['all', 'active', 'completed'].forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value === 'all' ? 'Все' : value === 'active' ? 'Активные' : 'Выполненные';
            filterSelect.appendChild(option);
        });
        controls.appendChild(filterSelect);

        // поиск
        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Поиск по названию...';
        controls.appendChild(searchInput);

        // кнопка сортировки
        sortButton = document.createElement('button');
        sortButton.textContent = 'Сортировать по дате (возр.)';
        controls.appendChild(sortButton);

        app.appendChild(controls);

        // контейнер для задач
        tasksContainer = document.createElement('div');
        tasksContainer.id = 'tasks-container';
        tasksContainer.className = 'tasks-container';
        app.appendChild(tasksContainer);

        // обработчики
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = titleInput.value.trim();
            const date = dateInput.value;
            if (!title || !date) return;

            tasks.push({
                id: Date.now(),
                title,
                date,
                completed: false
            });
            saveTasks();
            renderTasks();
            titleInput.value = '';
            dateInput.value = new Date().toISOString().split('T')[0];
        });

        filterSelect.addEventListener('change', () => {
            filterStatus = filterSelect.value;
            renderTasks();
        });

        searchInput.addEventListener('input', () => {
            searchQuery = searchInput.value.toLowerCase();
            renderTasks();
        });

        sortButton.addEventListener('click', () => {
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            sortButton.textContent = sortOrder === 'asc' ? 'Сортировать по дате (возр.)' : 'Сортировать по дате (убыв.)';
            renderTasks();
        });
    }

    // отрисовка списка задач
    function renderTasks() {
        tasksContainer.innerHTML = '';
        const tasksToShow = getFilteredAndSortedTasks();

        if (tasksToShow.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = 'Нет задач';
            tasksContainer.appendChild(emptyMsg);
            return;
        }

        tasksToShow.forEach(task => {
            tasksContainer.appendChild(createTaskElement(task));
        });
    }

    // создание элемента задачи
    function createTaskElement(task) {
        const item = document.createElement('div');
        item.className = `task-item ${task.completed ? 'completed' : ''}`;
        item.dataset.id = task.id;
        item.draggable = true;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

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

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Ред.';
        editBtn.addEventListener('click', () => startEditTask(item, task));
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.addEventListener('click', () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        item.appendChild(checkbox);
        item.appendChild(infoDiv);
        item.appendChild(actionsDiv);

        // Drag & Drop
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);

        return item;
    }

    // редактирование задачи
    function startEditTask(taskElement, task) {
        const originalId = task.id;
        const editForm = document.createElement('form');
        editForm.className = 'edit-form';

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = task.title;
        titleInput.required = true;

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.value = task.date;
        dateInput.required = true;

        const saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.textContent = 'Сохранить';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Отмена';

        editForm.appendChild(titleInput);
        editForm.appendChild(dateInput);
        editForm.appendChild(saveBtn);
        editForm.appendChild(cancelBtn);

        taskElement.innerHTML = '';
        taskElement.appendChild(editForm);

        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newTitle = titleInput.value.trim();
            const newDate = dateInput.value;
            if (newTitle && newDate) {
                const foundTask = tasks.find(t => t.id === originalId);
                if (foundTask) {
                    foundTask.title = newTitle;
                    foundTask.date = newDate;
                    saveTasks();
                }
            }
            renderTasks();
        });

        cancelBtn.addEventListener('click', () => renderTasks());
    }

    // --- Drag & Drop ---
    function handleDragStart(e) {
        dragSourceId = e.target.closest('.task-item').dataset.id;
        e.dataTransfer.setData('text/plain', dragSourceId);
        e.target.style.opacity = '0.5';
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(e) {
        e.preventDefault();
        const target = e.target.closest('.task-item');
        if (!target) return;

        const targetId = target.dataset.id;
        if (dragSourceId === targetId) return;

        const sourceIndex = tasks.findIndex(t => t.id == dragSourceId);
        const targetIndex = tasks.findIndex(t => t.id == targetId);

        if (sourceIndex !== -1 && targetIndex !== -1) {
            const [movedTask] = tasks.splice(sourceIndex, 1);
            tasks.splice(targetIndex, 0, movedTask);
            saveTasks();
            renderTasks();
        }
    }

    function handleDragEnd(e) {
        e.target.style.opacity = '';
        dragSourceId = null;
    }

    // --- Инициализация ---
    function init() {
        buildUI();
        loadTasks();
        renderTasks();
    }

    init();
});