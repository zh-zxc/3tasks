class PomodoroTimer {
    constructor() {
        this.workDuration = 25 * 60; // 默认25分钟，以秒为单位
        this.breakDuration = 5 * 60; // 默认5分钟
        this.longBreakDuration = 15 * 60; // 默认15分钟
        this.currentTime = this.workDuration;
        this.currentMode = 'work'; // 'work', 'break', 'longBreak'
        this.isRunning = false;
        this.timerInterval = null;
        this.completedPomodoros = 0;
        this.currentStreak = 0;
        this.tasks = [];
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.timeDisplay = document.getElementById('time-display');
        this.timerMode = document.getElementById('timer-mode');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.workModeBtn = document.getElementById('work-mode');
        this.breakModeBtn = document.getElementById('break-mode');
        this.longBreakModeBtn = document.getElementById('long-break-mode');
        this.workDurationInput = document.getElementById('work-duration');
        this.breakDurationInput = document.getElementById('break-duration');
        this.longBreakDurationInput = document.getElementById('long-break-duration');
        this.taskInput = document.getElementById('task-input');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.taskList = document.getElementById('task-list');
        this.completedCount = document.getElementById('completed-count');
        this.currentStreak = document.getElementById('current-streak');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.workModeBtn.addEventListener('click', () => this.switchMode('work'));
        this.breakModeBtn.addEventListener('click', () => this.switchMode('break'));
        this.longBreakModeBtn.addEventListener('click', () => this.switchMode('longBreak'));
        
        this.workDurationInput.addEventListener('change', () => this.updateSettings());
        this.breakDurationInput.addEventListener('change', () => this.updateSettings());
        this.longBreakDurationInput.addEventListener('change', () => this.updateSettings());
        
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.timerInterval = setInterval(() => {
                this.tick();
            }, 1000);
        }
    }
    
    pause() {
        this.isRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    reset() {
        this.pause();
        this.currentTime = this.getDurationForCurrentMode();
        this.updateDisplay();
    }
    
    tick() {
        this.currentTime--;
        this.updateDisplay();
        
        if (this.currentTime <= 0) {
            this.timerComplete();
        }
    }
    
    timerComplete() {
        this.pause();
        
        // 播放提示音（如果浏览器支持）
        this.playNotificationSound();
        
        // 显示通知
        this.showNotification();
        
        if (this.currentMode === 'work') {
            // 工作时间结束，进入休息时间
            this.completedPomodoros++;
            this.currentStreak++;
            this.updateStats();
            
            // 每4个番茄钟后进入长休息
            if (this.completedPomodoros % 4 === 0) {
                this.switchMode('longBreak');
            } else {
                this.switchMode('break');
            }
        } else {
            // 休息时间结束，返回工作时间
            this.switchMode('work');
        }
        
        // 自动开始下一个计时
        setTimeout(() => {
            this.start();
        }, 1000);
    }
    
    playNotificationSound() {
        try {
            // 创建音频上下文来播放简单音调
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (e) {
            console.log('无法播放提示音:', e);
        }
    }
    
    showNotification() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(`番茄钟完成！`, {
                    body: this.currentMode === 'work' 
                        ? '工作时间结束，现在休息一下吧！' 
                        : '休息时间结束，继续工作吧！',
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23667eea"/><text x="50" y="55" font-family="Arial" font-size="20" fill="white" text-anchor="middle">🍅</text></svg>'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(`番茄钟完成！`, {
                            body: this.currentMode === 'work' 
                                ? '工作时间结束，现在休息一下吧！' 
                                : '休息时间结束，继续工作吧！',
                            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23667eea"/><text x="50" y="55" font-family="Arial" font-size="20" fill="white" text-anchor="middle">🍅</text></svg>'
                        });
                    }
                });
            }
        }
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        this.currentTime = this.getDurationForMode(mode);
        this.pause();
        this.updateDisplay();
        this.updateModeButtons();
    }
    
    getDurationForMode(mode) {
        switch (mode) {
            case 'work': return this.workDuration;
            case 'break': return this.breakDuration;
            case 'longBreak': return this.longBreakDuration;
            default: return this.workDuration;
        }
    }
    
    getDurationForCurrentMode() {
        return this.getDurationForMode(this.currentMode);
    }
    
    updateModeButtons() {
        this.workModeBtn.classList.toggle('active', this.currentMode === 'work');
        this.breakModeBtn.classList.toggle('active', this.currentMode === 'break');
        this.longBreakModeBtn.classList.toggle('active', this.currentMode === 'longBreak');
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        let modeText = '';
        switch (this.currentMode) {
            case 'work': modeText = '工作时间'; break;
            case 'break': modeText = '休息时间'; break;
            case 'longBreak': modeText = '长休息时间'; break;
        }
        this.timerMode.textContent = modeText;
        
        // 根据模式改变显示颜色
        this.timeDisplay.style.color = this.currentMode === 'work' ? '#667eea' : '#4CAF50';
    }
    
    updateSettings() {
        this.workDuration = parseInt(this.workDurationInput.value) * 60 || 25 * 60;
        this.breakDuration = parseInt(this.breakDurationInput.value) * 60 || 5 * 60;
        this.longBreakDuration = parseInt(this.longBreakDurationInput.value) * 60 || 15 * 60;
        
        // 如果当前模式的时长改变了，更新当前时间
        if (this.currentMode === 'work') {
            this.currentTime = this.workDuration;
        } else if (this.currentMode === 'break') {
            this.currentTime = this.breakDuration;
        } else if (this.currentMode === 'longBreak') {
            this.currentTime = this.longBreakDuration;
        }
        
        this.updateDisplay();
        this.saveSettings();
    }
    
    loadSettings() {
        const settings = localStorage.getItem('pomodoroSettings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.workDurationInput.value = parsed.workDuration || 25;
            this.breakDurationInput.value = parsed.breakDuration || 5;
            this.longBreakDurationInput.value = parsed.longBreakDuration || 15;
            
            this.workDuration = (parsed.workDuration || 25) * 60;
            this.breakDuration = (parsed.breakDuration || 5) * 60;
            this.longBreakDuration = (parsed.longBreakDuration || 15) * 60;
            
            this.currentTime = this.workDuration;
        }
        
        // 加载统计数据
        const stats = localStorage.getItem('pomodoroStats');
        if (stats) {
            const parsed = JSON.parse(stats);
            this.completedPomodoros = parsed.completedPomodoros || 0;
            this.currentStreak = parsed.currentStreak || 0;
            this.updateStats();
        }
        
        // 加载任务列表
        const tasks = localStorage.getItem('pomodoroTasks');
        if (tasks) {
            this.tasks = JSON.parse(tasks);
            this.renderTasks();
        }
    }
    
    saveSettings() {
        const settings = {
            workDuration: parseInt(this.workDurationInput.value),
            breakDuration: parseInt(this.breakDurationInput.value),
            longBreakDuration: parseInt(this.longBreakDurationInput.value)
        };
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }
    
    updateStats() {
        this.completedCount.textContent = this.completedPomodoros;
        this.currentStreak.textContent = this.currentStreak;
        
        // 保存统计数据到本地存储
        const stats = {
            completedPomodoros: this.completedPomodoros,
            currentStreak: this.currentStreak
        };
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    }
    
    addTask() {
        const taskText = this.taskInput.value.trim();
        if (taskText) {
            const task = {
                id: Date.now(),
                text: taskText,
                completed: false
            };
            this.tasks.push(task);
            this.taskInput.value = '';
            this.renderTasks();
            this.saveTasks();
        }
    }
    
    renderTasks() {
        this.taskList.innerHTML = '';
        
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="task-item-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                </div>
                <button class="task-delete" data-id="${task.id}">删除</button>
            `;
            this.taskList.appendChild(li);
        });
        
        // 为新添加的复选框和删除按钮绑定事件
        this.taskList.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = parseInt(e.target.dataset.id);
                this.toggleTask(taskId, e.target.checked);
            });
        });
        
        this.taskList.querySelectorAll('.task-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.id);
                this.deleteTask(taskId);
            });
        });
    }
    
    toggleTask(taskId, completed) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = completed;
            this.saveTasks();
            this.renderTasks(); // 重新渲染以更新样式
        }
    }
    
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }
    
    saveTasks() {
        localStorage.setItem('pomodoroTasks', JSON.stringify(this.tasks));
    }
}

// 页面加载完成后初始化番茄钟
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});

// 页面可见性变化时暂停/恢复计时器
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时暂停（可选功能）
        // 可以根据需要启用
    }
});