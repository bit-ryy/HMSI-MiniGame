// Purpose: Synthesizer-based sound effects using the Web Audio API
// Used By: ui.js, game.js, input.js
// Depends On: None
// Impact: Generates dynamic retro 8-bit audio cues (hit, beep, gameover) without relying on external sound files

export const SoundFX = {
    ctx: null,
    enabled: true,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    play(type) {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        if (type === 'hit') {
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gainNode.gain.setValueAtTime(0.12, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
        } else if (type === 'gameover') {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.8);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
            oscillator.start(now);
            oscillator.stop(now + 0.8);
        } else if (type === 'click') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, now);
            oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.05);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            oscillator.start(now);
            oscillator.stop(now + 0.05);
        } else if (type === 'beep') {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(420, now);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
        } else if (type === 'go') {
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(820, now);
            oscillator.frequency.exponentialRampToValueAtTime(620, now + 0.3);
            gainNode.gain.setValueAtTime(0.12, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
        }
    }
};