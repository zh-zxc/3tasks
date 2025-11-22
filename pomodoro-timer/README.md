# 番茄钟应用 (重构版)

一个功能齐全的番茄钟Web应用，帮助您提高工作效率和时间管理能力。

## 特性

- **计时功能**：工作时间（25分钟）、休息时间（5分钟）、长休息时间（15分钟）
- **模式切换**：支持工作/休息/长休模式自由切换
- **任务管理**：添加、完成、删除任务列表
- **统计追踪**：记录完成的番茄钟数量和连续完成数
- **自定义设置**：可调整各时间段时长
- **通知提醒**：时间结束时的视觉和声音提醒
- **数据持久化**：所有设置和数据通过localStorage保存
- **响应式设计**：适配各种设备屏幕

## 重构说明

本项目已重构为模块化结构，主要改进包括：

- **模块化架构**：将功能拆分为独立模块（Timer, NotificationManager, TaskManager, StatsManager, SettingsManager, TaskView, PomodoroApp）
- **面向对象设计**：使用ES6类和模块化导入导出
- **可维护性**：清晰的代码结构和职责分离
- **可扩展性**：易于添加新功能和修改现有功能

### 模块说明

- `Timer.js`: 核心计时器逻辑
- `NotificationManager.js`: 通知和声音管理
- `TaskManager.js`: 任务管理（增删改查）
- `StatsManager.js`: 统计数据管理
- `SettingsManager.js`: 应用设置管理
- `TaskView.js`: 任务列表UI视图
- `PomodoroApp.js`: 主应用控制器

## 使用方法

### 本地运行

1. 克隆或下载项目
2. 使用现代浏览器打开 `index.html` 文件
3. 或者启动本地服务器：
   ```bash
   cd pomodoro-timer
   python -m http.server 8000
   ```
   然后访问 http://localhost:8000

### 功能操作

- 点击"开始"按钮启动计时器
- 使用"工作/休息/长休"按钮切换模式
- 在设置区域调整时间长度
- 在任务列表中添加和管理任务
- 完成番茄钟后查看统计数据

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Web APIs (localStorage, Notification, Web Audio)

## 部署

项目完全静态，可直接部署到GitHub Pages、Netlify、Vercel等静态托管服务。

### GitHub Pages部署

1. 将项目推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择源码分支（通常是main或gh-pages）

## 文件结构

```
pomodoro-timer/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # 主入口文件（模块化）
├── src/                # 源代码模块
│   ├── Timer.js
│   ├── NotificationManager.js
│   ├── TaskManager.js
│   ├── StatsManager.js
│   ├── SettingsManager.js
│   ├── TaskView.js
│   └── PomodoroApp.js
├── docs/               # 文档
│   └── DEPLOYMENT.md
├── README.md
├── 404.html
├── CNAME
└── package.json
```

## 浏览器兼容性

支持所有现代浏览器（Chrome, Firefox, Safari, Edge）。

## 许可证

MIT