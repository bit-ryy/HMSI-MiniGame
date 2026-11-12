// Purpose: Centralized event listeners for touch, mouse clicks, and Numpad keyboard shortcuts
// Used By: main.js
// Depends On: config.js, audio.js, ui.js, game.js
// Impact: Translates physical user inputs into in-game hitting actions and keyboard menu navigation

import { state } from './config.js';
import { SoundFX } from './audio.js';
import { dom, slots, isModalOpen, goToDifficultyScreen } from './ui.js';
import { whack } from './game.js';

export function initInput() {
    let lastTouchTime = 0;

    Object.keys(slots).forEach(key => {
        const slotEl = slots[key];

        // Gunakan touchstart TANPA preventDefault agar Chrome Android mengizinkan navigator.vibrate
        slotEl.addEventListener('touchstart', () => {
            lastTouchTime = Date.now();
            whack(key);
        }, { passive: true });

        // Fallback untuk Mouse Desktop & pemicu User Gesture resmi
        slotEl.addEventListener('click', () => {
            if (Date.now() - lastTouchTime < 450) return; // Cegah double trigger setelah touchstart
            whack(key);
        });
    });

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

        if (e.code === 'KeyS' && (state.gameState === 'MENU' || state.gameState === 'DIFFICULTY' || state.gameState === 'GAMEOVER')) {
            if (!dom.confirmModal.classList.contains('hidden')) return;
            dom.settingsModal.classList.toggle('hidden');
            SoundFX.play('click');
            return;
        }

        if (isModalOpen()) return;

        if (e.code === 'KeyM' && state.gameState === 'MENU') {
            e.preventDefault();
            SoundFX.play('click');
            goToDifficultyScreen();
            return;
        }

        if (e.code === 'KeyR' && state.gameState === 'GAMEOVER') {
            e.preventDefault();
            SoundFX.play('click');
            goToDifficultyScreen();
            return;
        }

        if (state.isPlaying) {
            const key = e.key;
            if (slots[key]) {
                e.preventDefault();
                whack(key);
            }
        }
    });
}