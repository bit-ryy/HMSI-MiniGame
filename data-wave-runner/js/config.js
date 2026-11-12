// Purpose: Global state management, default configuration, and LocalStorage handlers
// Used By: ui.js, input.js, main.js
// Depends On: Browser LocalStorage API
// Impact: Maintains single source of truth for high scores, user preferences, and real-time game state

export const defaultSettings = {
    theme: 'dark',
    bgm: true,
    sfx: true,
    angle: 'standard',
    glow: true,
    shake: true
};

export const userSettings = JSON.parse(localStorage.getItem('dwr_settings')) || { ...defaultSettings };

export const state = {
    gameState: 'BOOT', // BOOT, LOADING, MENU, PLAYING, GAMEOVER
    isHolding: false,
    baseSpeed: 3.1,
    payloadKB: 0,
    highScoreKB: parseFloat(localStorage.getItem('dwr_highscore_kb')) || 0,
    gridOffset: 0,
    isLightModeActive: false
};

export function saveSettings() {
    localStorage.setItem('dwr_settings', JSON.stringify(userSettings));
}

export function saveHighScore(kb) {
    state.highScoreKB = kb;
    localStorage.setItem('dwr_highscore_kb', kb);
}

export function resetHighScore() {
    state.highScoreKB = 0;
    localStorage.removeItem('dwr_highscore_kb');
}

export function formatPayload(kb) {
    if (kb >= 1024) {
        return (kb / 1024).toFixed(2) + ' MB';
    }
    return kb.toFixed(1) + ' KB';
}