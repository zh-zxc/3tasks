// src/TaskView.js
// 任务视图模块
export class TaskView {
    constructor(taskManager, containerElement) {
        this.taskManager = taskManager;
        this.container = containerElement;
        this.taskItemTemplate = this.createTaskItemTemplate();
        this.render();
        this.bindEvents();
    }

    createTaskItemTemplate() {
        // 创建任务项的HTML模板
        return (task) => `
            <li class="task-item" data-id="${task.id}">
                <div class="task-item-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} id="task-${task.id}">
                    <label for="task-${task.id}" class="task-text ${task.completed ? 'completed' : ''}">${task.text}</label>
                </div>
                <button class="task-delete" aria-label="删除任务">×</button>
            </li>
        `;
    }

    render() {
        const tasks = this.taskManager.getAllTasks();
        this.container.innerHTML = '';
        
        if (tasks.length === 0) {
            this.container.innerHTML = '<li class="empty-task-list">暂无任务，添加一个任务开始吧！</li>';
            return;
        }

        tasks.forEach(task => {
            const taskElement = document.createElement('li');
            taskElement.innerHTML = this.taskItemTemplate(task).trim();
            this.container.appendChild(taskElement);
        });
    }

    bindEvents() {
        // 使用事件委托处理任务列表的事件
        this.container.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.taskManager.toggleTask(taskId);
                this.render(); // 重新渲染以更新样式
            }
        });

        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('task-delete')) {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.taskManager.deleteTask(taskId);
                this.render(); // 重新渲染以移除任务
            }
        });
    }

    update() {
        this.render();
    }
}