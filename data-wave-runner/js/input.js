// Purpose: Centralized event listeners for keyboard, mouse, and touch inputs
// Used By: main.js
// Depends On: config.js, audio.js, ui.js
// Impact: Translates physical user inputs into in-game actions and keyboard shortcuts

import { state, userSettings } from './config.js';
import { SoundFX } from './audio.js';
import { dom, isModalOpen } from './ui.js';

export function setHold(val) {
    if (state.gameState !== 'PLAYING') {
        state.isHolding = false;
        return;
    }
    if (val && !state.isHolding) {
        SoundFX.play('waveUp');
    }
    state.isHolding = val;
}

export function initInput(onStartGame) {
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Escape') {
            if (!dom.confirmModal.classList.contains('hidden')) {
                dom.confirmModal.classList.add('hidden');
                SoundFX.play('click');
                return;
            }
            if (!dom.settingsModal.classList.contains('hidden')) {
                dom.settingsModal.classList.add('hidden');
                SoundFX.play('click');
                return;
            }
        }

        if (e.code === 'KeyS' && (state.gameState === 'MENU' || state.gameState === 'GAMEOVER')) {
            if (!dom.confirmModal.classList.contains('hidden')) return;
            dom.settingsModal.classList.toggle('hidden');
            SoundFX.play('click');
            return;
        }

        if (isModalOpen()) return;

        if (e.code === 'KeyM' && state.gameState === 'MENU') {
            e.preventDefault();
            SoundFX.play('click');
            dom.menuScreen.classList.add('hidden');
            dom.btnOpenSettings.classList.add('hidden');
            if (userSettings.bgm) dom.bgm.play().catch(() => { });
            onStartGame();
            return;
        }

        if (e.code === 'KeyR' && state.gameState === 'GAMEOVER') {
            e.preventDefault();
            SoundFX.play('click');
            dom.gameoverScreen.classList.add('hidden');
            dom.btnOpenSettings.classList.add('hidden');
            if (userSettings.bgm) dom.bgm.play().catch(() => { });
            onStartGame();
            return;
        }

        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
            if (state.gameState === 'PLAYING') {
                e.preventDefault();
                setHold(true);
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
            setHold(false);
        }
    });

    window.addEventListener('mousedown', (e) => {
        if (e.target.closest('button') || e.target.closest('.settings-box') || e.target.closest('.confirm-box')) return;
        if (e.button === 0) setHold(true);
    });
    window.addEventListener('mouseup', () => setHold(false));

    window.addEventListener('touchstart', (e) => {
        if (e.target.closest('button') || e.target.closest('.settings-box') || e.target.closest('.confirm-box')) return;
        if (state.gameState === 'PLAYING') {
            e.preventDefault();
            setHold(true);
        }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        if (e.target.closest('button') || e.target.closest('.settings-box') || e.target.closest('.confirm-box')) return;
        if (state.gameState === 'PLAYING') {
            e.preventDefault();
            setHold(false);
        }
    }, { passive: false });

    window.addEventListener('touchcancel', () => setHold(false));
}