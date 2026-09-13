const STORAGE_KEY = "daylist-tasks";

const taskInput = document.querySelector("#taskInput");
const addForm = document.querySelector("#addForm");
const taskList = document.querySelector("#taskList");
const emptyState = document.querySelector("#emptyState");
const emptyTitle = document.querySelector("#emptyTitle");
const emptyHint = document.querySelector("#emptyHint");
const progressText = document.querySelector("#progressText");
const clearCompleted = document.querySelector("#clearCompleted");
const footerStatus = document.querySelector("#footerStatus");
const dateLabel = document.querySelector("#dateLabel");
const countLabels = {
  all: document.querySelector("#allCount"),
  active: document.querySelector("#activeCount"),
  completed: document.querySelector("#completedCount")
};

let tasks = loadTasks();
let activeFilter = "all";

dateLabel.textContent = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric"
}).format(new Date());

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  footerStatus.textContent = "Saved in your browser";
}

function createTask(text) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: text.trim(),
    completed: false
  };
}

function visibleTasks() {
  if (activeFilter === "active") return tasks.filter((task) => !task.completed);
  if (activeFilter === "completed") return tasks.filter((task) => task.completed);
  return tasks;
}

function updateCounts() {
  const completed = tasks.filter((task) => task.completed).length;
  countLabels.all.textContent = tasks.length;
  countLabels.active.textContent = tasks.length - completed;
  countLabels.completed.textContent = completed;
  progressText.textContent = `${tasks.length - completed} ${tasks.length - completed === 1 ? "thing" : "things"} to do`;
}

function render() {
  taskList.replaceChildren();
  updateCounts();

  const shownTasks = visibleTasks();
  shownTasks.forEach((task, index) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " is-complete" : ""}`;
    item.style.animationDelay = `${index * 35}ms`;

    const checkButton = document.createElement("button");
    checkButton.className = "task-check";
    checkButton.type = "button";
    checkButton.setAttribute("aria-label", task.completed ? `Mark ${task.text} as open` : `Complete ${task.text}`);
    checkButton.textContent = "✓";
    checkButton.addEventListener("click", () => toggleTask(task.id));

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-task";
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `Delete ${task.text}`);
    deleteButton.textContent = "×";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(checkButton, taskText, deleteButton);
    taskList.append(item);
  });

  const hasNoVisibleTasks = shownTasks.length === 0;
  emptyState.hidden = !hasNoVisibleTasks;
  if (activeFilter === "completed" && tasks.length > 0) {
    emptyTitle.textContent = "Nothing finished yet.";
    emptyHint.textContent = "Complete a task and it will appear here.";
  } else if (activeFilter === "active" && tasks.length > 0) {
    emptyTitle.textContent = "You are all caught up.";
    emptyHint.textContent = "A quiet list is a good list.";
  } else {
    emptyTitle.textContent = "Your list is clear.";
    emptyHint.textContent = "Add something small to get started.";
  }
}

function toggleTask(id) {
  tasks = tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.unshift(createTask(text));
  taskInput.value = "";
  saveTasks();
  render();
  taskInput.focus();
});

document.querySelectorAll(".filter-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    activeFilter = tab.dataset.filter;
    document.querySelectorAll(".filter-tab").forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", isActive);
    });
    render();
  });
});

clearCompleted.addEventListener("click", () => {
  if (!tasks.some((task) => task.completed)) return;
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

render();
