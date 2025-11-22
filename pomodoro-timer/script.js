// 番茄钟应用主脚本
(function() {
  'use strict';

  // DOM元素引用
  const elements = {
    timeText: document.getElementById('timeText'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    workModeBtn: document.getElementById('workModeBtn'),
    breakModeBtn: document.getElementById('breakModeBtn'),
    longBreakModeBtn: document.getElementById('longBreakModeBtn'),
    workDuration: document.getElementById('workDuration'),
    breakDuration: document.getElementById('breakDuration'),
    longBreakDuration: document.getElementById('longBreakDuration'),
    completedPomodoros: document.getElementById('completedPomodoros'),
    currentStreak: document.getElementById('currentStreak'),
    longestStreak: document.getElementById('longestStreak'),
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    taskList: document.getElementById('taskList'),
    alarmSound: document.getElementById('alarmSound'),
    progressCanvas: document.getElementById('progressCanvas')
  };

  // 应用状态
  const state = {
    isRunning: false,
    isPaused: false,
    currentMode: 'work', // 'work', 'break', 'longBreak'
    timeLeft: 25 * 60, // 以秒为单位
    initialTime: 25 * 60,
    timerInterval: null,
    completedPomodoros: 0,
    currentStreak: 0,
    longestStreak: 0,
    tasks: [],
    currentTaskId: 0
  };

  // Canvas绘图上下文
  const ctx = elements.progressCanvas.getContext('2d');
  const centerX = elements.progressCanvas.width / 2;
  const centerY = elements.progressCanvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;

  // 初始化应用
  function init() {
    loadSettings();
    loadStats();
    loadTasks();
    updateDisplay();
    drawProgress();
    
    // 绑定事件监听器
    bindEvents();
  }

  // 绑定事件监听器
  function bindEvents() {
    elements.startBtn.addEventListener('click', startTimer);
    elements.pauseBtn.addEventListener('click', pauseTimer);
    elements.resetBtn.addEventListener('click', resetTimer);
    
    elements.workModeBtn.addEventListener('click', () => switchMode('work'));
    elements.breakModeBtn.addEventListener('click', () => switchMode('break'));
    elements.longBreakModeBtn.addEventListener('click', () => switchMode('longBreak'));
    
    elements.workDuration.addEventListener('change', updateSettings);
    elements.breakDuration.addEventListener('change', updateSettings);
    elements.longBreakDuration.addEventListener('change', updateSettings);
    
    elements.addTaskBtn.addEventListener('click', addTask);
    elements.taskInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') addTask();
    });
  }

  // 开始计时器
  function startTimer() {
    if (state.isRunning) return;
    
    state.isRunning = true;
    state.isPaused = false;
    
    elements.startBtn.disabled = true;
    elements.pauseBtn.disabled = false;
    
    state.timerInterval = setInterval(updateTimer, 1000);
  }

  // 暂停计时器
  function pauseTimer() {
    if (!state.isRunning) return;
    
    state.isPaused = true;
    clearInterval(state.timerInterval);
    
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
  }

  // 重置计时器
  function resetTimer() {
    clearInterval(state.timerInterval);
    state.isRunning = false;
    state.isPaused = false;
    
    // 恢复到当前模式的初始时间
    switch (state.currentMode) {
      case 'work':
        state.timeLeft = parseInt(elements.workDuration.value) * 60;
        break;
      case 'break':
        state.timeLeft = parseInt(elements.breakDuration.value) * 60;
        break;
      case 'longBreak':
        state.timeLeft = parseInt(elements.longBreakDuration.value) * 60;
        break;
    }
    
    state.initialTime = state.timeLeft;
    
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    
    updateDisplay();
    drawProgress();
  }

  // 切换模式
  function switchMode(mode) {
    // 保存当前模式的剩余时间
    if (state.currentMode === 'work' && !state.isRunning) {
      elements.workDuration.value = Math.ceil(state.timeLeft / 60);
    } else if (state.currentMode === 'break' && !state.isRunning) {
      elements.breakDuration.value = Math.ceil(state.timeLeft / 60);
    } else if (state.currentMode === 'longBreak' && !state.isRunning) {
      elements.longBreakDuration.value = Math.ceil(state.timeLeft / 60);
    }
    
    // 设置新模式
    state.currentMode = mode;
    
    // 更新按钮状态
    elements.workModeBtn.classList.toggle('active', mode === 'work');
    elements.breakModeBtn.classList.toggle('active', mode === 'break');
    elements.longBreakModeBtn.classList.toggle('active', mode === 'longBreak');
    
    // 设置新时间
    switch (mode) {
      case 'work':
        state.timeLeft = parseInt(elements.workDuration.value) * 60;
        break;
      case 'break':
        state.timeLeft = parseInt(elements.breakDuration.value) * 60;
        break;
      case 'longBreak':
        state.timeLeft = parseInt(elements.longBreakDuration.value) * 60;
        break;
    }
    
    state.initialTime = state.timeLeft;
    
    // 重置计时器状态
    clearInterval(state.timerInterval);
    state.isRunning = false;
    state.isPaused = false;
    
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    
    updateDisplay();
    drawProgress();
  }

  // 更新计时器
  function updateTimer() {
    if (state.timeLeft <= 0) {
      // 时间到
      clearInterval(state.timerInterval);
      state.isRunning = false;
      playAlarm();
      showNotification();
      
      // 如果是工作模式，增加完成的番茄钟数量
      if (state.currentMode === 'work') {
        state.completedPomodoros++;
        state.currentStreak++;
        if (state.currentStreak > state.longestStreak) {
          state.longestStreak = state.currentStreak;
        }
        
        // 检查是否需要长休息
        if (state.completedPomodoros % 4 === 0) {
          switchMode('longBreak');
        } else {
          switchMode('break');
        }
      } else {
        // 休息结束，切换到工作模式
        switchMode('work');
      }
      
      updateStats();
      saveStats();
    } else {
      state.timeLeft--;
      updateDisplay();
      drawProgress();
    }
  }

  // 更新显示
  function updateDisplay() {
    const minutes = Math.floor(state.timeLeft / 60);
    const seconds = state.timeLeft % 60;
    elements.timeText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // 根据模式更新显示样式
    if (state.currentMode === 'work') {
      elements.timeText.style.color = '#e74c3c';
      document.title = `🍅 ${elements.timeText.textContent} - 工作时间`;
    } else {
      elements.timeText.style.color = '#2ecc71';
      document.title = `☕ ${elements.timeText.textContent} - ${state.currentMode === 'break' ? '休息时间' : '长休息时间'}`;
    }
  }

  // 绘制进度环
  function drawProgress() {
    ctx.clearRect(0, 0, elements.progressCanvas.width, elements.progressCanvas.height);
    
    // 绘制背景圆环
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 20;
    ctx.stroke();
    
    // 计算进度
    const progress = (state.initialTime - state.timeLeft) / state.initialTime;
    const endAngle = -Math.PI / 2 + (2 * Math.PI * progress);
    
    // 绘制进度圆环
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
    ctx.strokeStyle = state.currentMode === 'work' ? '#e74c3c' : '#2ecc71';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // 更新设置
  function updateSettings() {
    // 更新当前模式的时间（如果计时器未运行）
    if (!state.isRunning) {
      switch (state.currentMode) {
        case 'work':
          state.timeLeft = parseInt(elements.workDuration.value) * 60;
          break;
        case 'break':
          state.timeLeft = parseInt(elements.breakDuration.value) * 60;
          break;
        case 'longBreak':
          state.timeLeft = parseInt(elements.longBreakDuration.value) * 60;
          break;
      }
      state.initialTime = state.timeLeft;
      updateDisplay();
      drawProgress();
    }
    
    saveSettings();
  }

  // 播放警报声音
  function playAlarm() {
    elements.alarmSound.currentTime = 0;
    elements.alarmSound.play().catch(e => console.log('音频播放失败:', e));
  }

  // 显示通知
  function showNotification() {
    if (Notification.permission === 'granted') {
      new Notification(`时间到了！`, {
        body: state.currentMode === 'work' 
          ? '工作时间结束，休息一下吧！' 
          : '休息时间结束，继续工作吧！',
        icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23e74c3c"/><text x="50" y="55" font-family="Arial" font-size="30" fill="white" text-anchor="middle">🍅</text></svg>'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(`时间到了！`, {
            body: state.currentMode === 'work' 
              ? '工作时间结束，休息一下吧！' 
              : '休息时间结束，继续工作吧！',
            icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23e74c3c"/><text x="50" y="55" font-family="Arial" font-size="30" fill="white" text-anchor="middle">🍅</text></svg>'
          });
        }
      });
    }
  }

  // 更新统计数据
  function updateStats() {
    elements.completedPomodoros.textContent = state.completedPomodoros;
    elements.currentStreak.textContent = state.currentStreak;
    elements.longestStreak.textContent = state.longestStreak;
  }

  // 添加任务
  function addTask() {
    const taskText = elements.taskInput.value.trim();
    if (!taskText) return;
    
    const task = {
      id: state.currentTaskId++,
      text: taskText,
      completed: false,
      createdAt: new Date()
    };
    
    state.tasks.push(task);
    renderTask(task);
    
    elements.taskInput.value = '';
    saveTasks();
  }

  // 渲染任务
  function renderTask(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    
    const taskText = document.createElement('span');
    taskText.className = `task-text ${task.completed ? 'completed' : ''}`;
    taskText.textContent = task.text;
    
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete';
    completeBtn.textContent = task.completed ? '撤销' : '完成';
    completeBtn.addEventListener('click', () => toggleTaskComplete(task.id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '删除';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    taskActions.appendChild(completeBtn);
    taskActions.appendChild(deleteBtn);
    
    li.appendChild(taskText);
    li.appendChild(taskActions);
    
    elements.taskList.appendChild(li);
  }

  // 切换任务完成状态
  function toggleTaskComplete(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    
    task.completed = !task.completed;
    
    const li = document.querySelector(`li[data-id="${id}"]`);
    if (li) {
      const taskText = li.querySelector('.task-text');
      const completeBtn = li.querySelector('.complete');
      
      taskText.classList.toggle('completed', task.completed);
      completeBtn.textContent = task.completed ? '撤销' : '完成';
    }
    
    saveTasks();
  }

  // 删除任务
  function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    
    const li = document.querySelector(`li[data-id="${id}"]`);
    if (li) {
      li.remove();
    }
    
    saveTasks();
  }

  // 渲染所有任务
  function renderAllTasks() {
    elements.taskList.innerHTML = '';
    state.tasks.forEach(task => renderTask(task));
  }

  // 保存设置到本地存储
  function saveSettings() {
    const settings = {
      workDuration: elements.workDuration.value,
      breakDuration: elements.breakDuration.value,
      longBreakDuration: elements.longBreakDuration.value
    };
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }

  // 加载设置
  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('pomodoroSettings')) || {};
    
    if (settings.workDuration) elements.workDuration.value = settings.workDuration;
    if (settings.breakDuration) elements.breakDuration.value = settings.breakDuration;
    if (settings.longBreakDuration) elements.longBreakDuration.value = settings.longBreakDuration;
  }

  // 保存统计数据到本地存储
  function saveStats() {
    const stats = {
      completedPomodoros: state.completedPomodoros,
      currentStreak: state.currentStreak,
      longestStreak: state.longestStreak
    };
    localStorage.setItem('pomodoroStats', JSON.stringify(stats));
  }

  // 加载统计数据
  function loadStats() {
    const stats = JSON.parse(localStorage.getItem('pomodoroStats')) || {};
    
    state.completedPomodoros = stats.completedPomodoros || 0;
    state.currentStreak = stats.currentStreak || 0;
    state.longestStreak = stats.longestStreak || 0;
    
    updateStats();
  }

  // 保存任务到本地存储
  function saveTasks() {
    localStorage.setItem('pomodoroTasks', JSON.stringify(state.tasks));
  }

  // 加载任务
  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('pomodoroTasks')) || [];
    state.tasks = tasks;
    state.currentTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 0;
    renderAllTasks();
  }

  // 页面加载完成后初始化应用
  document.addEventListener('DOMContentLoaded', init);
})();