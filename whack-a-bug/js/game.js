// Purpose: Core gameplay logic (spawn timers, hit detection, countdown, and session end)
// Used By: input.js, main.js
// Depends On: config.js, audio.js, ui.js
// Impact: Drives the bug spawning mechanic, score calculation, time limit, and game-over state transitions

import { state, userSettings, saveHighScore } from './config.js';
import { SoundFX } from './audio.js';
import { dom, slots } from './ui.js';

export function resetSlotContent(slotEl) {
    if (!slotEl) return;
    const key = slotEl.getAttribute('data-key');
    slotEl.innerHTML = `<span class="numpad-hint">[${key}]</span>`;
    slotEl.classList.remove('slot-hit');
}

export function startCountdown() {
    state.gameState = 'COUNTDOWN';
    dom.gameoverScreen.classList.add('hidden');
    dom.playArea.classList.add('hidden');
    dom.countdownScreen.classList.remove('hidden');

    let count = 3;
    dom.countdownText.innerText = count;
    SoundFX.play('beep');

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            dom.countdownText.innerText = count;
            SoundFX.play('beep');
        } else if (count === 0) {
            dom.countdownText.innerText = 'GO!';
            SoundFX.play('go');
        } else {
            clearInterval(countdownInterval);
            dom.countdownScreen.classList.add('hidden');
            startGame();
        }
    }, 900);
}

export function spawnBug() {
    // 1. Bersihkan slot sebelumnya jika bug belum sempat terpukul
    if (state.activeSlot) {
        resetSlotContent(state.activeSlot);
    }

    const keys = Object.keys(slots);
    let randomKey;
    do {
        randomKey = keys[Math.floor(Math.random() * keys.length)];
    } while (randomKey === state.lastSlotKey && keys.length > 1);

    state.lastSlotKey = randomKey;
    state.activeSlot = slots[randomKey];

    // 2. Bersihkan slot tujuan (menghapus teks '// FIXED' jika sebelumnya sudah terpukul)
    resetSlotContent(state.activeSlot);

    const bugElement = document.createElement('div');
    bugElement.classList.add('bug');
    bugElement.innerText = '👾';
    state.activeSlot.appendChild(bugElement);
}

export function whack(key) {
    if (!state.isPlaying) return;

    const targetSlot = slots[key];
    if (!targetSlot) return;

    targetSlot.classList.add('slot-active');
    setTimeout(() => targetSlot.classList.remove('slot-active'), 100);

    if (state.activeSlot && state.activeSlot.id === `slot-${key}`) {
        state.score += 10;
        dom.scoreDisplay.innerText = state.score;

        SoundFX.play('hit');

        if (userSettings.haptic) {
            SoundFX.vibrate(65);
        }

        if (userSettings.impact) {
            state.activeSlot.classList.add('slot-hit');
        }
        state.activeSlot.innerHTML = `<span class="fixed-text">// FIXED</span><span class="numpad-hint">[${key}]</span>`;
        state.activeSlot = null;
    }
}

export function startGame() {
    state.gameState = 'PLAYING';
    state.isPlaying = true;
    state.score = 0;
    state.timeLeft = 30;
    dom.scoreDisplay.innerText = state.score;
    dom.timeDisplay.innerText = state.timeLeft;

    dom.playArea.classList.remove('hidden');
    Object.values(slots).forEach(slotEl => resetSlotContent(slotEl));

    spawnBug();
    state.bugTimer = setInterval(spawnBug, state.bugSpeed);

    state.gameTimer = setInterval(() => {
        state.timeLeft--;
        dom.timeDisplay.innerText = state.timeLeft;

        if (state.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

export function endGame() {
    state.gameState = 'GAMEOVER';
    state.isPlaying = false;
    clearInterval(state.gameTimer);
    clearInterval(state.bugTimer);

    if (state.activeSlot) {
        resetSlotContent(state.activeSlot);
        state.activeSlot = null;
    }

    dom.playArea.classList.add('hidden');
    dom.bgm.pause();
    SoundFX.play('gameover');

    if (state.score > state.highScore) {
        saveHighScore(state.score);
        dom.bestScoreDisplay.innerText = state.highScore;
    }

    dom.finalScoreDisplay.innerText = state.score;
    dom.finalBestDisplay.innerText = state.highScore;
    dom.gameoverScreen.classList.remove('hidden');
    dom.btnOpenSettings.classList.remove('hidden');
}