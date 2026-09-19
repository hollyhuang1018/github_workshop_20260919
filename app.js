// 這個檔案負責管理待辦清單的資料、渲染與事件處理。
const STORAGE_KEY = 'todo-list-items';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoCount = document.getElementById('todo-count');
const emptyState = document.getElementById('empty-state');

// 從 localStorage 讀取資料，若不存在則回傳空陣列。
let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// 儲存待辦資料到 localStorage。
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 重新計算並更新未完成項目數量。
function updateCount() {
  const remainingCount = todos.filter((todo) => !todo.completed).length;
  todoCount.textContent = `未完成: ${remainingCount} 項`;
}

// 根據 todos 陣列，更新畫面上的清單與空狀態。
function renderTodos() {
  todoList.innerHTML = '';

  if (todos.length === 0) {
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');
  }

  todos.forEach((todo) => {
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
      todos = todos.filter((itemTodo) => itemTodo.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    main.appendChild(checkbox);
    main.appendChild(text);
    item.appendChild(main);
    item.appendChild(deleteBtn);
    todoList.appendChild(item);
  });

  updateCount();
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

  todoInput.value = '';
  todoInput.focus();
  saveTodos();
  renderTodos();
}

// 監聽表單送出與輸入欄位 Enter 按鍵。
todoForm.addEventListener('submit', addTodo);

// 初始渲染。
renderTodos();
