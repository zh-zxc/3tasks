// src/TaskManager.js
// 任务管理模块
export class TaskManager {
    constructor(storageKey = 'pomodoroTasks') {
        this.storageKey = storageKey;
        this.tasks = this.loadTasks();
    }

    addTask(text) {
        if (!text.trim()) return null;

        const task = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        return task;
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            return task;
        }
        return null;
    }

    deleteTask(taskId) {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        
        if (initialLength !== this.tasks.length) {
            this.saveTasks();
            return true;
        }
        return false;
    }

    updateTask(taskId, newText) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.text = newText.trim();
            this.saveTasks();
            return task;
        }
        return null;
    }

    getAllTasks() {
        return [...this.tasks]; // 返回副本以防止外部修改
    }

    getCompletedTasks() {
        return this.tasks.filter(task => task.completed);
    }

    getPendingTasks() {
        return this.tasks.filter(task => !task.completed);
    }

    loadTasks() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('加载任务失败:', e);
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
        } catch (e) {
            console.error('保存任务失败:', e);
        }
    }

    clearAllTasks() {
        this.tasks = [];
        this.saveTasks();
    }
}