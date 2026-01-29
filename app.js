// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.taskIdCounter = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
        this.updateStats();
    }

    setupEventListeners() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        
        // Enter key to add task
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Event delegation for task list
        const taskList = document.getElementById('taskList');
        taskList.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                const id = parseInt(e.target.id.replace('checkbox-', ''));
                this.toggleTask(id);
            }
        });
        
        taskList.addEventListener('click', (e) => {
            if (e.target.classList.contains('task-delete')) {
                const id = parseInt(e.target.id.replace('delete-', ''));
                this.deleteTask(id);
            }
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskCategory = document.getElementById('taskCategory');
        const taskText = taskInput.value.trim();

        if (taskText === '') {
            this.showNotification('Bitte gib eine Aufgabe ein!', 'error');
            return;
        }

        const task = {
            id: Date.now() + this.taskIdCounter++,
            text: taskText,
            category: taskCategory.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.render();
        this.updateStats();
        
        // Clear input
        taskInput.value = '';
        taskInput.focus();

        this.showNotification('Aufgabe hinzugefügt!', 'success');
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    deleteTask(id) {
        if (confirm('Möchtest du diese Aufgabe wirklich löschen?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
            this.updateStats();
            this.showNotification('Aufgabe gelöscht!', 'success');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'all':
                return this.tasks;
            case 'completed':
                return this.tasks.filter(t => t.completed);
            case 'persönlich':
            case 'klasse':
            case 'business':
                return this.tasks.filter(t => t.category === this.currentFilter);
            default:
                return this.tasks;
        }
    }

    render() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        taskList.style.display = 'flex';
        emptyState.style.display = 'none';

        taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
    }

    createTaskHTML(task) {
        const date = new Date(task.createdAt).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        return `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    id="checkbox-${task.id}"
                    ${task.completed ? 'checked' : ''}
                />
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span class="task-category-badge ${task.category}">${task.category}</span>
                        <span class="task-date">${date}</span>
                    </div>
                </div>
                <button class="task-delete" id="delete-${task.id}">Löschen</button>
            </div>
        `;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
    }

    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        } catch (e) {
            console.error('Failed to save tasks to localStorage:', e);
            this.showNotification('Fehler beim Speichern der Aufgaben', 'error');
        }
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('tasks');
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Failed to load tasks from localStorage:', e);
            return [];
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Animation styles for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
