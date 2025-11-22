// 番茄钟应用 - 单文件版本，兼容GitHub Pages
(function() {
    'use strict';

    // Timer类 - 计时器模块
    class Timer {
        constructor(duration, onTick, onComplete) {
            this.duration = duration;
            this.remainingTime = duration;
            this.onTick = onTick;
            this.onComplete = onComplete;
            this.intervalId = null;
            this.isRunning = false;
        }

        start() {
            if (this.isRunning) return;
            
            this.isRunning = true;
            this.intervalId = setInterval(() => {
                this.tick();
            }, 1000);
        }

        pause() {
            this.isRunning = false;
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }

        reset() {
            this.pause();
            this.remainingTime = this.duration;
            if (this.onTick) this.onTick(this.remainingTime);
        }

        tick() {
            this.remainingTime--;
            if (this.onTick) this.onTick(this.remainingTime);

            if (this.remainingTime <= 0) {
                this.complete();
            }
        }

        complete() {
            this.pause();
            if (this.onComplete) this.onComplete();
        }

        setDuration(newDuration) {
            this.duration = newDuration;
            if (!this.isRunning) {
                this.remainingTime = newDuration;
                if (this.onTick) this.onTick(this.remainingTime);
            }
        }

        getTimeFormatted() {
            const minutes = Math.floor(this.remainingTime / 60);
            const seconds = this.remainingTime % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // NotificationManager类 - 通知管理模块
    class NotificationManager {
        static requestPermission() {
            if ('Notification' in window) {
                return Notification.requestPermission();
            }
            return Promise.resolve('denied');
        }

        static showNotification(title, body, icon) {
            if ('Notification' in window && Notification.permission === 'granted') {
                try {
                    new Notification(title, {
                        body: body,
                        icon: icon
                    });
                } catch (e) {
                    console.warn('通知显示失败:', e);
                }
            }
        }

        static async playNotificationSound() {
            try {
                // 检查是否支持Web Audio API
                if (!window.AudioContext && !window.webkitAudioContext) {
                    return;
                }

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
                console.warn('无法播放提示音:', e);
            }
        }
    }

    // TaskManager类 - 任务管理模块
    class TaskManager {
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

    // StatsManager类 - 统计数据管理模块
    class StatsManager {
        constructor(storageKey = 'pomodoroStats') {
            this.storageKey = storageKey;
            this.stats = this.loadStats();
        }

        incrementCompletedPomodoros() {
            this.stats.completedPomodoros = (this.stats.completedPomodoros || 0) + 1;
            this.updateStreak();
            this.saveStats();
            return this.stats.completedPomodoros;
        }

        incrementCurrentStreak() {
            this.stats.currentStreak = (this.stats.currentStreak || 0) + 1;
            this.saveStats();
            return this.stats.currentStreak;
        }

        resetStreak() {
            this.stats.currentStreak = 0;
            this.saveStats();
        }

        updateStreak() {
            this.stats.currentStreak = (this.stats.currentStreak || 0) + 1;
            // 可以添加逻辑来处理断开连续的情况
            this.saveStats();
        }

        getStats() {
            return { ...this.stats }; // 返回副本以防止外部修改
        }

        setStats(stats) {
            this.stats = {
                completedPomodoros: stats.completedPomodoros || 0,
                currentStreak: stats.currentStreak || 0
            };
            this.saveStats();
        }

        loadStats() {
            try {
                const stored = localStorage.getItem(this.storageKey);
                return stored ? JSON.parse(stored) : {
                    completedPomodoros: 0,
                    currentStreak: 0
                };
            } catch (e) {
                console.error('加载统计数据失败:', e);
                return {
                    completedPomodoros: 0,
                    currentStreak: 0
                };
            }
        }

        saveStats() {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
            } catch (e) {
                console.error('保存统计数据失败:', e);
            }
        }
    }

    // SettingsManager类 - 设置管理模块
    class SettingsManager {
        constructor(storageKey = 'pomodoroSettings') {
            this.storageKey = storageKey;
            this.settings = this.loadSettings();
        }

        getSetting(key, defaultValue) {
            return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
        }

        setSetting(key, value) {
            this.settings[key] = value;
            this.saveSettings();
        }

        getWorkDuration() {
            return this.getSetting('workDuration', 25) * 60; // 转换为秒
        }

        getBreakDuration() {
            return this.getSetting('breakDuration', 5) * 60; // 转换为秒
        }

        getLongBreakDuration() {
            return this.getSetting('longBreakDuration', 15) * 60; // 转换为秒
        }

        setWorkDuration(minutes) {
            this.setSetting('workDuration', minutes);
        }

        setBreakDuration(minutes) {
            this.setSetting('breakDuration', minutes);
        }

        setLongBreakDuration(minutes) {
            this.setSetting('longBreakDuration', minutes);
        }

        getAllSettings() {
            return { ...this.settings };
        }

        setAllSettings(settings) {
            this.settings = {
                workDuration: settings.workDuration || 25,
                breakDuration: settings.breakDuration || 5,
                longBreakDuration: settings.longBreakDuration || 15
            };
            this.saveSettings();
        }

        loadSettings() {
            try {
                const stored = localStorage.getItem(this.storageKey);
                const defaults = {
                    workDuration: 25,
                    breakDuration: 5,
                    longBreakDuration: 15
                };
                
                if (stored) {
                    const parsed = JSON.parse(stored);
                    // 确保所有必需的设置都有默认值
                    return {
                        workDuration: parsed.workDuration || defaults.workDuration,
                        breakDuration: parsed.breakDuration || defaults.breakDuration,
                        longBreakDuration: parsed.longBreakDuration || defaults.longBreakDuration
                    };
                }
                return defaults;
            } catch (e) {
                console.error('加载设置失败:', e);
                return {
                    workDuration: 25,
                    breakDuration: 5,
                    longBreakDuration: 15
                };
            }
        }

        saveSettings() {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            } catch (e) {
                console.error('保存设置失败:', e);
            }
        }
    }

    // TaskView类 - 任务视图模块
    class TaskView {
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

    // PomodoroApp类 - 主应用模块
    class PomodoroApp {
        constructor() {
            // 初始化管理器
            this.settingsManager = new SettingsManager();
            this.statsManager = new StatsManager();
            this.taskManager = new TaskManager();
            
            // 初始化状态
            this.currentMode = 'work'; // 'work', 'break', 'longBreak'
            this.timer = null;
            
            // 缓存DOM元素
            this.elements = {};
            
            // 初始化应用
            this.initializeElements();
            this.initializeTimer();
            this.initializeTaskView();
            this.bindEvents();
            this.updateDisplay();
            this.loadSettings();
            
            // 请求通知权限
            NotificationManager.requestPermission();
        }

        initializeElements() {
            // 缓存DOM元素以提高性能
            this.elements = {
                timeDisplay: document.getElementById('time-display'),
                timerMode: document.getElementById('timer-mode'),
                startBtn: document.getElementById('start-btn'),
                pauseBtn: document.getElementById('pause-btn'),
                resetBtn: document.getElementById('reset-btn'),
                workModeBtn: document.getElementById('work-mode'),
                breakModeBtn: document.getElementById('break-mode'),
                longBreakModeBtn: document.getElementById('long-break-mode'),
                workDurationInput: document.getElementById('work-duration'),
                breakDurationInput: document.getElementById('break-duration'),
                longBreakDurationInput: document.getElementById('long-break-duration'),
                taskInput: document.getElementById('task-input'),
                addTaskBtn: document.getElementById('add-task-btn'),
                taskList: document.getElementById('task-list'),
                completedCount: document.getElementById('completed-count'),
                currentStreak: document.getElementById('current-streak')
            };
        }

        initializeTimer() {
            const duration = this.getDurationForCurrentMode();
            this.timer = new Timer(
                duration,
                (remainingTime) => this.onTimerTick(remainingTime), // onTick
                () => this.onTimerComplete() // onComplete
            );
        }

        initializeTaskView() {
            this.taskView = new TaskView(this.taskManager, this.elements.taskList);
        }

        bindEvents() {
            // 控制按钮事件
            this.elements.startBtn.addEventListener('click', () => this.start());
            this.elements.pauseBtn.addEventListener('click', () => this.pause());
            this.elements.resetBtn.addEventListener('click', () => this.reset());

            // 模式切换事件
            this.elements.workModeBtn.addEventListener('click', () => this.switchMode('work'));
            this.elements.breakModeBtn.addEventListener('click', () => this.switchMode('break'));
            this.elements.longBreakModeBtn.addEventListener('click', () => this.switchMode('longBreak'));

            // 设置更改事件
            this.elements.workDurationInput.addEventListener('change', () => this.updateSettings());
            this.elements.breakDurationInput.addEventListener('change', () => this.updateSettings());
            this.elements.longBreakDurationInput.addEventListener('change', () => this.updateSettings());

            // 任务相关事件
            this.elements.addTaskBtn.addEventListener('click', () => this.addTask());
            this.elements.taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addTask();
            });
        }

        start() {
            this.timer.start();
            this.updateControlButtons();
        }

        pause() {
            this.timer.pause();
            this.updateControlButtons();
        }

        reset() {
            this.timer.reset();
            this.updateDisplay();
            this.updateControlButtons();
        }

        onTimerTick(remainingTime) {
            this.updateDisplay();
        }

        onTimerComplete() {
            // 播放提示音
            NotificationManager.playNotificationSound();
            
            // 显示通知
            const title = '番茄钟完成！';
            const body = this.currentMode === 'work' 
                ? '工作时间结束，现在休息一下吧！' 
                : '休息时间结束，继续工作吧！';
            const icon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23667eea"/><text x="50" y="55" font-family="Arial" font-size="20" fill="white" text-anchor="middle">🍅</text></svg>';
            
            NotificationManager.showNotification(title, body, icon);

            if (this.currentMode === 'work') {
                // 工作时间结束，更新统计数据
                this.statsManager.incrementCompletedPomodoros();
                this.updateStatsDisplay();
                
                // 检查是否需要长休息
                const completedCount = this.statsManager.getStats().completedPomodoros;
                if (completedCount % 4 === 0) {
                    this.switchMode('longBreak');
                } else {
                    this.switchMode('break');
                }
            } else {
                // 休息时间结束，返回工作模式
                this.switchMode('work');
            }

            // 自动开始下一个计时（可选）
            // setTimeout(() => {
            //     this.start();
            // }, 1000);
        }

        switchMode(mode) {
            this.currentMode = mode;
            this.timer.setDuration(this.getDurationForMode(mode));
            this.timer.reset(); // 重置到新模式的初始时间
            this.updateDisplay();
            this.updateModeButtons();
        }

        getDurationForMode(mode) {
            switch (mode) {
                case 'work': return this.settingsManager.getWorkDuration();
                case 'break': return this.settingsManager.getBreakDuration();
                case 'longBreak': return this.settingsManager.getLongBreakDuration();
                default: return this.settingsManager.getWorkDuration();
            }
        }

        getDurationForCurrentMode() {
            return this.getDurationForMode(this.currentMode);
        }

        updateModeButtons() {
            // 使用更简洁的方式更新按钮状态
            const buttons = {
                'work': this.elements.workModeBtn,
                'break': this.elements.breakModeBtn,
                'longBreak': this.elements.longBreakModeBtn
            };
            
            Object.entries(buttons).forEach(([mode, button]) => {
                button.classList.toggle('active', this.currentMode === mode);
            });
        }

        updateDisplay() {
            if (!this.timer) return;
            
            // 更新时间显示
            this.elements.timeDisplay.textContent = this.timer.getTimeFormatted();
            
            // 更新模式显示
            const modeTexts = {
                'work': '工作时间',
                'break': '休息时间',
                'longBreak': '长休息时间'
            };
            this.elements.timerMode.textContent = modeTexts[this.currentMode] || '工作时间';
            
            // 根据模式改变显示颜色
            const modeColors = {
                'work': '#667eea',
                'break': '#4CAF50',
                'longBreak': '#FF9800'
            };
            this.elements.timeDisplay.style.color = modeColors[this.currentMode] || modeColors['work'];
        }

        updateControlButtons() {
            const isRunning = this.timer.isRunning;
            this.elements.startBtn.disabled = isRunning;
            this.elements.pauseBtn.disabled = !isRunning;
        }

        updateSettings() {
            // 更新设置管理器中的值
            const workDuration = parseInt(this.elements.workDurationInput.value) || 25;
            const breakDuration = parseInt(this.elements.breakDurationInput.value) || 5;
            const longBreakDuration = parseInt(this.elements.longBreakDurationInput.value) || 15;
            
            this.settingsManager.setWorkDuration(workDuration);
            this.settingsManager.setBreakDuration(breakDuration);
            this.settingsManager.setLongBreakDuration(longBreakDuration);
            
            // 如果当前模式的时长改变了，更新当前时间
            this.timer.setDuration(this.getDurationForCurrentMode());
            
            this.updateDisplay();
        }

        loadSettings() {
            // 加载设置到UI
            const settings = this.settingsManager.getAllSettings();
            this.elements.workDurationInput.value = settings.workDuration || 25;
            this.elements.breakDurationInput.value = settings.breakDuration || 5;
            this.elements.longBreakDurationInput.value = settings.longBreakDuration || 15;
            
            // 更新统计数据显示
            this.updateStatsDisplay();
        }

        updateStatsDisplay() {
            const stats = this.statsManager.getStats();
            this.elements.completedCount.textContent = stats.completedPomodoros || 0;
            this.elements.currentStreak.textContent = stats.currentStreak || 0;
        }

        addTask() {
            const taskText = this.elements.taskInput.value.trim();
            if (taskText) {
                this.taskManager.addTask(taskText);
                this.elements.taskInput.value = '';
                this.taskView.update();
            }
        }
    }

    // 页面加载完成后初始化番茄钟
    document.addEventListener('DOMContentLoaded', () => {
        new PomodoroApp();
    });

    // 页面可见性变化时的处理
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // 页面隐藏时可选的操作
            // 暂停计时器等
        }
    });

    // 导出到全局作用域以供其他脚本使用（如果需要）
    window.PomodoroApp = PomodoroApp;
})();