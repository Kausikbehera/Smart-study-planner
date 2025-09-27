// DOM Elements
const addTaskForm = document.getElementById('addTaskForm');
const tasksContainer = document.getElementById('tasksContainer');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const completionRateEl = document.getElementById('completionRate');
const notification = document.getElementById('notification');

// State
let tasks = JSON.parse(localStorage.getItem('studyTasks')) || [];
let currentFilter = 'all';

// Initialize the app
function init() {
    renderTasks();
    updateProgress();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    addTaskForm.addEventListener('submit', handleAddTask);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            renderTasks();
        });
    });
}

// Handle form submission
function handleAddTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const subject = document.getElementById('taskSubject').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;
    const description = document.getElementById('taskDescription').value;
    
    const newTask = {
        id: Date.now(),
        title,
        subject,
        dueDate,
        priority,
        description,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    updateProgress();
    showNotification('Task added successfully!');
    
    addTaskForm.reset();
}

// Toggle task completion
function toggleTaskCompletion(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    updateProgress();
    
    const task = tasks.find(t => t.id === taskId);
    const message = task.completed ? 'Task marked as complete!' : 'Task marked as pending.';
    showNotification(message);
}

// Delete a task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        updateProgress();
        showNotification('Task deleted successfully!');
    }
}

// Filter tasks based on current filter
function getFilteredTasks() {
    switch (currentFilter) {
        case 'pending':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// Render tasks to the DOM
function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="no-tasks">
                <i class="fas fa-clipboard-list" style="font-size: 3rem; color: #6c757d; margin-bottom: 1rem;"></i>
                <p>No tasks found. Add a new task to get started!</p>
            </div>
        `;
        return;
    }
    
    tasksContainer.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''} ${task.priority === 'high' ? 'urgent' : ''}">
            <div class="task-title">${task.title}</div>
            <div class="task-details">
                <span>${task.subject}</span>
                <span>${formatDate(task.dueDate)}</span>
            </div>
            <p>${task.description || 'No description provided.'}</p>
            <div class="task-actions">
                <button class="action-btn toggle-btn" onclick="toggleTaskCompletion(${task.id})">
                    ${task.completed ? 'Mark Pending' : 'Mark Complete'}
                </button>
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Update progress statistics
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    completionRateEl.textContent = `${rate}%`;
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('studyTasks', JSON.stringify(tasks));
}

// Format date for display
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Show notification
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.classList.remove('error');
    
    if (isError) {
        notification.classList.add('error');
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
