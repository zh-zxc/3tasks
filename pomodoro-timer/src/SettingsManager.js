// src/SettingsManager.js
// 设置管理模块
export class SettingsManager {
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