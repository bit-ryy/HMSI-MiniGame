// Purpose: Global state management, default configuration, and LocalStorage handlers
// Used By: ui.js, game.js, input.js, main.js
// Depends On: Browser LocalStorage API
// Impact: Maintains single source of truth for high scores, user preferences (theme, haptic), and real-time game state

export const defaultSettings = {
    theme: 'dark',
    bgm: true,
    sfx: true,
    haptic: true,
    glow: true,
    impact: true
};

export const userSettings = JSON.parse(localStorage.getItem('wab_settings')) || { ...defaultSettings };

export const state = {
    gameState: 'BOOT', // BOOT, LOADING, MENU, DIFFICULTY, COUNTDOWN, PLAYING, GAMEOVER
    score: 0,
    highScore: parseInt(localStorage.getItem('wab_highscore')) || 0,
    timeLeft: 30,
    activeSlot: null,
    lastSlotKey: null,
    gameTimer: null,
    bugTimer: null,
    isPlaying: false,
    bugSpeed: 750
};

export function saveSettings() {
    localStorage.setItem('wab_settings', JSON.stringify(userSettings));
}

export function saveHighScore(val) {
    state.highScore = val;
    localStorage.setItem('wab_highscore', val);
}

export function resetHighScore() {
    state.highScore = 0;
    localStorage.removeItem('wab_highscore');
}