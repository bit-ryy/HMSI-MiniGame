// Purpose: DOM manipulation, UI state transitions, HUD updates, and Settings Modal logic
// Used By: main.js, input.js
// Depends On: config.js, audio.js
// Impact: Bridges the core game loop with the HTML interface, applying themes and handling user UI clicks

import { state, userSettings, saveSettings, resetHighScore, formatPayload } from './config.js';
import { SoundFX } from './audio.js';

export const dom = {
    gameWrapper: document.getElementById('game-wrapper'),
    bgm: document.getElementById('bgm'),
    bootScreen: document.getElementById('boot-screen'),
    loadingScreen: document.getElementById('loading-screen'),
    loadingText: document.getElementById('loading-text'),
    loadingBar: document.getElementById('loading-bar'),
    menuScreen: document.getElementById('menu-screen'),
    gameoverScreen: document.getElementById('gameover-screen'),
    settingsModal: document.getElementById('settings-modal'),
    confirmModal: document.getElementById('confirm-modal'),
    btnOpenSettings: document.getElementById('btn-open-settings'),
    hud: document.getElementById('hud'),
    scoreDisplay: document.getElementById('score-display'),
    highscoreDisplay: document.getElementById('highscore-display'),
    shieldBadge: document.getElementById('shield-badge'),
    turboBadge: document.getElementById('turbo-badge'),
    finalScoreEl: document.getElementById('final-score'),
    finalBestEl: document.getElementById('final-best')
};

dom.bgm.volume = 0.3;

export function isModalOpen() {
    return !dom.settingsModal.classList.contains('hidden') || !dom.confirmModal.classList.contains('hidden');
}

export function triggerScreenShake() {
    if (!userSettings.shake) return;
    dom.gameWrapper.classList.remove('shake');
    void dom.gameWrapper.offsetWidth;
    dom.gameWrapper.classList.add('shake');
}

export function applySettings(player) {
    const sysPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    if (userSettings.theme === 'light' || (userSettings.theme === 'system' && sysPrefersLight)) {
        document.body.classList.add('theme-light');
        state.isLightModeActive = true;
    } else {
        document.body.classList.remove('theme-light');
        state.isLightModeActive = false;
    }

    document.querySelectorAll('#theme-selector .seg-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === userSettings.theme);
    });

    SoundFX.enabled = userSettings.sfx;
    const btnBgm = document.getElementById('toggle-bgm');
    const btnSfx = document.getElementById('toggle-sfx');

    btnBgm.innerText = `BGM: ${userSettings.bgm ? 'ON' : 'OFF'}`;
    btnBgm.classList.toggle('active', userSettings.bgm);

    btnSfx.innerText = `SFX: ${userSettings.sfx ? 'ON' : 'OFF'}`;
    btnSfx.classList.toggle('active', userSettings.sfx);

    if (!userSettings.bgm) {
        dom.bgm.pause();
    } else if (state.gameState === 'MENU' || state.gameState === 'PLAYING') {
        dom.bgm.play().catch(() => { });
    }

    if (player) player.setAnglePreset(userSettings.angle);
    document.querySelectorAll('#angle-selector .seg-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.angle === userSettings.angle);
    });

    const btnGlow = document.getElementById('toggle-glow');
    const btnShake = document.getElementById('toggle-shake');

    btnGlow.innerText = `Neon Glow: ${userSettings.glow ? 'ON' : 'OFF'}`;
    btnGlow.classList.toggle('active', userSettings.glow);
    document.body.classList.toggle('no-glow', !userSettings.glow);

    btnShake.innerText = `Getar Layar: ${userSettings.shake ? 'ON' : 'OFF'}`;
    btnShake.classList.toggle('active', userSettings.shake);
}

export function updateHUD(player) {
    dom.scoreDisplay.innerText = formatPayload(state.payloadKB);

    if (player.hasShield) {
        dom.shieldBadge.innerText = 'SHIELD: ACTIVE';
        dom.shieldBadge.className = 'badge badge-shield-on';
    } else {
        dom.shieldBadge.innerText = 'SHIELD: OFFLINE';
        dom.shieldBadge.className = 'badge badge-off';
    }

    if (player.turboTimer > 0) {
        const sec = Math.ceil(player.turboTimer / 60);
        dom.turboBadge.innerText = `OVERCLOCK: ${sec}s`;
        dom.turboBadge.className = 'badge badge-turbo-on';
    } else {
        dom.turboBadge.innerText = 'OVERCLOCK: OFF';
        dom.turboBadge.className = 'badge badge-off';
    }
}

export function initUI(player, onStartGame) {
    dom.highscoreDisplay.innerText = formatPayload(state.highScoreKB);
    applySettings(player);

    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
        if (userSettings.theme === 'system') applySettings(player);
    });

    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => SoundFX.play('click'));
    });

    dom.btnOpenSettings.addEventListener('click', () => dom.settingsModal.classList.remove('hidden'));
    document.getElementById('btn-close-settings').addEventListener('click', () => dom.settingsModal.classList.add('hidden'));

    document.querySelectorAll('#theme-selector .seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            userSettings.theme = btn.dataset.theme;
            saveSettings();
            applySettings(player);
        });
    });

    document.getElementById('toggle-bgm').addEventListener('click', () => {
        userSettings.bgm = !userSettings.bgm;
        saveSettings();
        applySettings(player);
    });

    document.getElementById('toggle-sfx').addEventListener('click', () => {
        userSettings.sfx = !userSettings.sfx;
        saveSettings();
        applySettings(player);
    });

    document.querySelectorAll('#angle-selector .seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            userSettings.angle = btn.dataset.angle;
            saveSettings();
            applySettings(player);
        });
    });

    document.getElementById('toggle-glow').addEventListener('click', () => {
        userSettings.glow = !userSettings.glow;
        saveSettings();
        applySettings(player);
    });

    document.getElementById('toggle-shake').addEventListener('click', () => {
        userSettings.shake = !userSettings.shake;
        saveSettings();
        applySettings(player);
    });

    document.getElementById('btn-reset-data').addEventListener('click', () => dom.confirmModal.classList.remove('hidden'));
    document.getElementById('btn-confirm-no').addEventListener('click', () => dom.confirmModal.classList.add('hidden'));
    document.getElementById('btn-confirm-yes').addEventListener('click', () => {
        resetHighScore();
        dom.highscoreDisplay.innerText = formatPayload(0);
        dom.finalBestEl.innerText = formatPayload(0);
        dom.confirmModal.classList.add('hidden');
    });

    document.getElementById('btn-power').addEventListener('click', () => {
        if (userSettings.bgm) {
            dom.bgm.play().then(() => dom.bgm.pause()).catch(() => { });
        }
        dom.bootScreen.classList.add('hidden');
        dom.loadingScreen.classList.remove('hidden');
        state.gameState = 'LOADING';

        setTimeout(() => {
            dom.loadingText.innerText = '> Menghubungkan ke gateway HMSI UNTAN...';
            dom.loadingBar.style.width = '40%';
        }, 600);

        setTimeout(() => {
            dom.loadingText.innerText = '> Mengkalibrasi gelombang fiber optik...';
            dom.loadingBar.style.width = '80%';
        }, 1400);

        setTimeout(() => {
            dom.loadingText.innerText = '> Koneksi terenkripsi siap.';
            dom.loadingBar.style.width = '100%';
        }, 2100);

        setTimeout(() => {
            dom.loadingScreen.classList.add('hidden');
            dom.menuScreen.classList.remove('hidden');
            dom.btnOpenSettings.classList.remove('hidden');
            state.gameState = 'MENU';
            if (userSettings.bgm) dom.bgm.play().catch(() => { });
        }, 2600);
    });

    document.getElementById('btn-start').addEventListener('click', () => {
        dom.menuScreen.classList.add('hidden');
        dom.settingsModal.classList.add('hidden');
        dom.confirmModal.classList.add('hidden');
        dom.btnOpenSettings.classList.add('hidden');
        if (userSettings.bgm) dom.bgm.play().catch(() => { });
        onStartGame();
    });

    document.getElementById('btn-retry').addEventListener('click', () => {
        dom.gameoverScreen.classList.add('hidden');
        dom.settingsModal.classList.add('hidden');
        dom.confirmModal.classList.add('hidden');
        dom.btnOpenSettings.classList.add('hidden');
        if (userSettings.bgm) dom.bgm.play().catch(() => { });
        onStartGame();
    });

    document.getElementById('btn-menu').addEventListener('click', () => {
        dom.gameoverScreen.classList.add('hidden');
        dom.hud.classList.add('hidden');
        dom.menuScreen.classList.remove('hidden');
        dom.btnOpenSettings.classList.remove('hidden');
        state.gameState = 'MENU';
        if (userSettings.bgm) dom.bgm.play().catch(() => { });
    });
}