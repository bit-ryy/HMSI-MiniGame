// Purpose: DOM references, UI state transitions, HUD updates, and Settings Modal logic
// Used By: game.js, input.js, main.js
// Depends On: config.js, audio.js
// Impact: Bridges the core game logic with the HTML interface, applying themes and handling menu navigation

import { state, userSettings, saveSettings, resetHighScore } from './config.js';
import { SoundFX } from './audio.js';

export const dom = {
    bgm: document.getElementById('bgm'),
    bootScreen: document.getElementById('boot-screen'),
    loadingScreen: document.getElementById('loading-screen'),
    loadingText: document.getElementById('loading-text'),
    loadingBar: document.getElementById('loading-bar'),
    startScreen: document.getElementById('start-screen'),
    difficultyScreen: document.getElementById('difficulty-screen'),
    countdownScreen: document.getElementById('countdown-screen'),
    gameoverScreen: document.getElementById('gameover-screen'),
    settingsModal: document.getElementById('settings-modal'),
    confirmModal: document.getElementById('confirm-modal'),
    btnOpenSettings: document.getElementById('btn-open-settings'),
    playArea: document.getElementById('play-area'),
    countdownText: document.getElementById('countdown-text'),
    finalScoreDisplay: document.getElementById('final-score'),
    finalBestDisplay: document.getElementById('final-best'),
    scoreDisplay: document.getElementById('score'),
    bestScoreDisplay: document.getElementById('best-score'),
    timeDisplay: document.getElementById('time')
};

export const slots = {
    '7': document.getElementById('slot-7'),
    '8': document.getElementById('slot-8'),
    '9': document.getElementById('slot-9'),
    '4': document.getElementById('slot-4'),
    '5': document.getElementById('slot-5'),
    '6': document.getElementById('slot-6'),
    '1': document.getElementById('slot-1'),
    '2': document.getElementById('slot-2'),
    '3': document.getElementById('slot-3')
};

dom.bgm.volume = 0.3;

export function isModalOpen() {
    return !dom.settingsModal.classList.contains('hidden') || !dom.confirmModal.classList.contains('hidden');
}

export function applySettings() {
    const sysPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    if (userSettings.theme === 'light' || (userSettings.theme === 'system' && sysPrefersLight)) {
        document.body.classList.add('theme-light');
    } else {
        document.body.classList.remove('theme-light');
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
    } else if (state.gameState === 'MENU' || state.gameState === 'DIFFICULTY' || state.gameState === 'PLAYING') {
        dom.bgm.play().catch(() => { });
    }

    const btnHaptic = document.getElementById('toggle-haptic');
    btnHaptic.innerText = `Haptic: ${userSettings.haptic ? 'ON' : 'OFF'}`;
    btnHaptic.classList.toggle('active', userSettings.haptic);

    const btnGlow = document.getElementById('toggle-glow');
    const btnImpact = document.getElementById('toggle-impact');

    btnGlow.innerText = `Neon Glow: ${userSettings.glow ? 'ON' : 'OFF'}`;
    btnGlow.classList.toggle('active', userSettings.glow);
    document.body.classList.toggle('no-glow', !userSettings.glow);

    btnImpact.innerText = `Impact FX: ${userSettings.impact ? 'ON' : 'OFF'}`;
    btnImpact.classList.toggle('active', userSettings.impact);
    document.body.classList.toggle('no-impact', !userSettings.impact);
}

export function goToDifficultyScreen() {
    dom.startScreen.classList.add('hidden');
    dom.gameoverScreen.classList.add('hidden');
    dom.settingsModal.classList.add('hidden');
    dom.confirmModal.classList.add('hidden');
    dom.difficultyScreen.classList.remove('hidden');
    dom.btnOpenSettings.classList.remove('hidden');
    state.gameState = 'DIFFICULTY';
    if (userSettings.bgm) dom.bgm.play().catch(() => { });
}

export function initUI(onStartCountdown) {
    dom.bestScoreDisplay.innerText = state.highScore;
    applySettings();

    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
        if (userSettings.theme === 'system') applySettings();
    });

    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => SoundFX.play('click'));
    });

    dom.btnOpenSettings.addEventListener('click', () => dom.settingsModal.classList.remove('hidden'));
    document.getElementById('btn-close-settings').addEventListener('click', () => dom.settingsModal.classList.add('hidden'));

    document.querySelectorAll('#theme-selector .seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            userSettings.theme = btn.dataset.theme;
            saveSettings();
            applySettings();
        });
    });

    document.getElementById('toggle-bgm').addEventListener('click', () => {
        userSettings.bgm = !userSettings.bgm;
        saveSettings();
        applySettings();
    });

    document.getElementById('toggle-sfx').addEventListener('click', () => {
        userSettings.sfx = !userSettings.sfx;
        saveSettings();
        applySettings();
    });

    document.getElementById('toggle-haptic').addEventListener('click', () => {
        userSettings.haptic = !userSettings.haptic;
        if (userSettings.haptic) SoundFX.vibrate(65);
        saveSettings();
        applySettings();
    });

    document.getElementById('toggle-glow').addEventListener('click', () => {
        userSettings.glow = !userSettings.glow;
        saveSettings();
        applySettings();
    });

    document.getElementById('toggle-impact').addEventListener('click', () => {
        userSettings.impact = !userSettings.impact;
        saveSettings();
        applySettings();
    });

    document.getElementById('btn-reset-data').addEventListener('click', () => dom.confirmModal.classList.remove('hidden'));
    document.getElementById('btn-confirm-no').addEventListener('click', () => dom.confirmModal.classList.add('hidden'));
    document.getElementById('btn-confirm-yes').addEventListener('click', () => {
        resetHighScore();
        dom.bestScoreDisplay.innerText = '0';
        dom.finalBestDisplay.innerText = '0';
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
            dom.loadingText.innerText = '> Menghubungkan ke server HMSI UNTAN...';
            dom.loadingBar.style.width = '40%';
        }, 600);

        setTimeout(() => {
            dom.loadingText.innerText = '> Memuat modul pembasmi bug 8-bit...';
            dom.loadingBar.style.width = '80%';
        }, 1400);

        setTimeout(() => {
            dom.loadingText.innerText = '> Sistem siap digunakan.';
            dom.loadingBar.style.width = '100%';
        }, 2100);

        setTimeout(() => {
            dom.loadingScreen.classList.add('hidden');
            dom.startScreen.classList.remove('hidden');
            dom.btnOpenSettings.classList.remove('hidden');
            state.gameState = 'MENU';
            if (userSettings.bgm) dom.bgm.play().catch(() => { });
        }, 2600);
    });

    document.getElementById('btn-mulai').addEventListener('click', goToDifficultyScreen);
    document.getElementById('btn-main-lagi').addEventListener('click', goToDifficultyScreen);

    document.querySelectorAll('.btn-level').forEach(button => {
        button.addEventListener('click', (e) => {
            state.bugSpeed = parseInt(e.currentTarget.getAttribute('data-speed'));
            dom.difficultyScreen.classList.add('hidden');
            dom.settingsModal.classList.add('hidden');
            dom.confirmModal.classList.add('hidden');
            dom.btnOpenSettings.classList.add('hidden');
            onStartCountdown();
        });
    });

    document.getElementById('btn-batal-level').addEventListener('click', () => {
        dom.difficultyScreen.classList.add('hidden');
        dom.startScreen.classList.remove('hidden');
        state.gameState = 'MENU';
    });

    document.getElementById('btn-tidak').addEventListener('click', () => {
        dom.gameoverScreen.classList.add('hidden');
        dom.startScreen.classList.remove('hidden');
        dom.btnOpenSettings.classList.remove('hidden');
        state.gameState = 'MENU';
        if (userSettings.bgm) dom.bgm.play().catch(() => { });
    });
}