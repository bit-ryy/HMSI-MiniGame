// Purpose: Centralized event listeners for pointer (touch/mouse) and Numpad keyboard shortcuts
// Used By: main.js
// Depends On: config.js, audio.js, ui.js, game.js
// Impact: Translates physical user inputs into in-game hitting actions and keyboard menu navigation

import { state } from './config.js';
import { SoundFX } from './audio.js';
import { dom, slots, isModalOpen, goToDifficultyScreen } from './ui.js';
import { whack } from './game.js';

export function initInput() {
    Object.keys(slots).forEach(key => {
        const slotEl = slots[key];

        // Gunakan pointerdown (tanpa preventDefault) agar browser mobile mengizinkan Vibration API
        slotEl.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
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