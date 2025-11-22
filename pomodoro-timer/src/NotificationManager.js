// src/NotificationManager.js
// 通知管理模块
export class NotificationManager {
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