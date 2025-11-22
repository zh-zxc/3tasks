// 重构后的主入口文件 - 保持向后兼容
import { PomodoroApp } from './src/PomodoroApp.js';

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