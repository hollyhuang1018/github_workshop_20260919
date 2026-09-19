// 這個檔案負責管理待辦清單的資料、渲染、篩選與深色模式切換。
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoCount = document.getElementById('todo-count');
const emptyState = document.getElementById('empty-state');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const themeText = themeToggle.querySelector('.theme-text');
const filterButtons = document.querySelectorAll('.filter-btn');
const STORAGE_KEY = 'todo-list-items';

// 預設篩選為全部，並記錄目前的篩選狀態。
let currentFilter = 'all';

// 待辦資料保存在記憶體中，並同步到 localStorage。
let todos = [];

function loadTodos() {
  try {
    const storedTodos = localStorage.getItem(STORAGE_KEY);
    return storedTodos ? JSON.parse(storedTodos) : [];
  } catch (error) {
    return [];
  }
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    // 忽略儲存失敗，避免影響主要待辦功能。
  }
}

// 偵測作業系統的深淺色偏好；若使用者從未手動切換，就以此為初始值。
let currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

// 依照目前主題，更新 HTML 的 data-theme 屬性與按鈕文字。
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  if (theme === 'dark') {
    themeIcon.textContent = '☀️';
    themeText.textContent = '淺色模式';
  } else {
    themeIcon.textContent = '🌙';
    themeText.textContent = '深色模式';
  }
}

// 依照目前篩選條件回傳符合條件的待辦項目。
function getFilteredTodos() {
  switch (currentFilter) {
    case 'active':
      return todos.filter((todo) => !todo.completed);
    case 'completed':
      return todos.filter((todo) => todo.completed);
    case 'all':
    default:
      return todos;
  }
}

// 重新計算並更新未完成項目數量，這個數字不受篩選影響。
function updateCount() {
  const remainingCount = todos.filter((todo) => !todo.completed).length;
  todoCount.textContent = `未完成: ${remainingCount} 項`;
}

// 根據是否有已完成項目更新清除按鈕狀態。
function updateClearCompletedButton() {
  const completedCount = todos.filter((todo) => todo.completed).length;
  const hasCompleted = completedCount > 0;

  clearCompletedBtn.classList.toggle('hidden', !hasCompleted);
  clearCompletedBtn.disabled = !hasCompleted;
  clearCompletedBtn.setAttribute('aria-label', `清除所有 ${completedCount} 筆已完成的待辦事項`);
}

// 產生篩選結果為空時的提示文字，讓使用者知道問題是被篩選條件遮住，不是被刪除。
function getEmptyStateMessage() {
  if (currentFilter === 'active') {
    return '目前沒有未完成的待辦事項。切換回「全部」或「已完成」可查看其他項目。';
  }

  if (currentFilter === 'completed') {
    return '目前沒有已完成的待辦事項。這筆項目只是被目前篩選條件過濾掉，並沒有被刪除。';
  }

  return '還沒有任何待辦事項,新增一個吧!';
}

// 根據篩選結果更新清單與空狀態文字。
function renderTodos() {
  const filteredTodos = getFilteredTodos();
  todoList.innerHTML = '';

  if (filteredTodos.length === 0) {
    emptyState.classList.add('visible');
    emptyState.textContent = getEmptyStateMessage();
  } else {
    emptyState.classList.remove('visible');
  }

  filteredTodos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = `todo-item${todo.completed ? ' completed' : ''}`;

    const main = document.createElement('div');
    main.className = 'todo-main';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `標記 ${todo.text} 完成`);

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '刪除';
    deleteBtn.setAttribute('aria-label', `刪除 ${todo.text}`);

    checkbox.addEventListener('change', () => {
      todo.completed = checkbox.checked;
      saveTodos();
      renderTodos();
    });

    deleteBtn.addEventListener('click', () => {
      const index = todos.findIndex((itemTodo) => itemTodo.id === todo.id);
      if (index !== -1) {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
      }
    });

    main.appendChild(checkbox);
    main.appendChild(text);
    item.appendChild(main);
    item.appendChild(deleteBtn);
    todoList.appendChild(item);
  });

  updateCount();
  updateClearCompletedButton();
}

// 新增待辦事件：忽略空白內容，避免新增空白項目。
function addTodo(event) {
  event.preventDefault();

  const value = todoInput.value.trim();

  if (!value) {
    todoInput.focus();
    return;
  }

  todos.push({
    id: Date.now(),
    text: value,
    completed: false,
  });

  saveTodos();
  todoInput.value = '';
  todoInput.focus();
  renderTodos();
}

function clearCompletedTodos() {
  const completedCount = todos.filter((todo) => todo.completed).length;

  if (completedCount === 0) {
    return;
  }

  const shouldDelete = window.confirm('確定要清除所有已完成的待辦事項嗎？');

  if (!shouldDelete) {
    return;
  }

  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
}

// 切換篩選狀態，並更新目前選中的按鈕樣式。
function setFilter(filterValue) {
  currentFilter = filterValue;

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filterValue;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  renderTodos();
}

// 點擊切換深色 / 淺色模式，依照目前狀態更新 UI。
themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
});

// 篩選按鈕點選事件。
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setFilter(button.dataset.filter);
  });
});

clearCompletedBtn.addEventListener('click', clearCompletedTodos);

// 表單送出時新增待辦事項。
todoForm.addEventListener('submit', addTodo);

// 頁面載入時初始設定主題與渲染清單。
todos = loadTodos();
applyTheme(currentTheme);
renderTodos();
