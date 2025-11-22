// src/PomodoroApp.js
// 主应用模块
import { Timer } from './Timer.js';
import { NotificationManager } from './NotificationManager.js';
import { TaskManager } from './TaskManager.js';
import { StatsManager } from './StatsManager.js';
import { SettingsManager } from './SettingsManager.js';
import { TaskView } from './TaskView.js';

export class PomodoroApp {
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