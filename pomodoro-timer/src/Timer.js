// src/Timer.js
// 番茄钟计时器模块
export class Timer {
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