// src/StatsManager.js
// 统计数据管理模块
export class StatsManager {
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