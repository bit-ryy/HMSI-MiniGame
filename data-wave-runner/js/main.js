// Purpose: Primary entry point and core Game Loop orchestration (requestAnimationFrame)
// Used By: index.html
// Depends On: config.js, audio.js, player.js, obstacle.js, item.js, ui.js, input.js
// Impact: Glues all modules together, driving the frame-by-frame updates and rendering pipeline

import { state, userSettings, saveHighScore, formatPayload } from './config.js';
import { SoundFX } from './audio.js';
import { Player } from './player.js';
import { ObstacleManager } from './obstacle.js';
import { ItemManager } from './item.js';
import { dom, initUI, updateHUD, triggerScreenShake } from './ui.js';
import { initInput, setHold } from './input.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = new Player(canvas.width, canvas.height);
const obstacles = new ObstacleManager(canvas.width, canvas.height);
const items = new ItemManager();

function syncCanvasSize() {
    const rect = dom.gameWrapper.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const isPortraitMobile = window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
    let targetW = 900;
    let targetH = 500;

    if (isPortraitMobile) {
        // Gunakan lebar dasar 460px dan hitung tinggi sesuai proporsi asli kontainer HP
        targetW = 460;
        targetH = Math.round(targetW * (rect.height / rect.width));
    }

    if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        player.resize(targetW, targetH);
        obstacles.resize(targetW, targetH);

        if (state.gameState !== 'PLAYING') {
            player.reset(targetW, targetH);
            obstacles.reset();
        }
    }
}

window.addEventListener('resize', syncCanvasSize);

function startGame() {
    syncCanvasSize();
    player.reset(canvas.width, canvas.height);
    obstacles.reset();
    items.reset();

    state.payloadKB = 0;
    state.baseSpeed = 3.1;
    setHold(false);
    state.gameState = 'PLAYING';

    dom.hud.classList.remove('hidden');
    updateHUD(player);
}

function triggerGameOver() {
    state.gameState = 'GAMEOVER';
    setHold(false);
    dom.bgm.pause();
    SoundFX.play('crash');
    triggerScreenShake();

    if (state.payloadKB > state.highScoreKB) {
        saveHighScore(state.payloadKB);
    }

    dom.finalScoreEl.innerText = formatPayload(state.payloadKB);
    dom.finalBestEl.innerText = formatPayload(state.highScoreKB);
    dom.highscoreDisplay.innerText = formatPayload(state.highScoreKB);

    dom.gameoverScreen.classList.remove('hidden');
    dom.btnOpenSettings.classList.remove('hidden');
}

function handleItemCollect(type) {
    if (type === 'data') {
        state.payloadKB += 50;
        SoundFX.play('pickup');
    } else if (type === 'shield') {
        player.hasShield = true;
        SoundFX.play('shieldOn');
    } else if (type === 'turbo') {
        player.turboTimer = 180;
        SoundFX.play('turbo');
    }
    updateHUD(player);
}

function drawBackgroundGrid(speed) {
    ctx.fillStyle = state.isLightModeActive ? '#f7f9fc' : '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    state.gridOffset = (state.gridOffset - speed * 0.5) % 40;
    ctx.strokeStyle = state.isLightModeActive ? '#e2e8f0' : '#262626';
    ctx.lineWidth = 1;

    for (let x = state.gridOffset; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function gameLoop() {
    if (state.gameState === 'PLAYING') {
        state.baseSpeed = Math.min(7.2, 3.1 + (state.payloadKB / 1800));
        const activeSpeed = player.turboTimer > 0 ? state.baseSpeed * 1.45 : state.baseSpeed;

        drawBackgroundGrid(activeSpeed);

        player.update(state.isHolding, activeSpeed);
        obstacles.update(activeSpeed, items);
        items.update(activeSpeed, player, handleItemCollect);

        state.payloadKB += activeSpeed * 0.08;
        updateHUD(player);

        const hit = obstacles.checkCollision(player);
        if (hit) {
            if (player.turboTimer > 0) {
                if (hit.type === 'hazard') {
                    obstacles.hazards.splice(hit.index, 1);
                    SoundFX.play('shieldBreak');
                    triggerScreenShake();
                } else if (hit.type === 'wall') {
                    const center = (hit.wall.topH + hit.wall.botY) / 2;
                    player.y += (center - player.y) * 0.35;
                }
            } else if (player.invincibleTimer > 0) {
                if (hit.type === 'wall') {
                    const center = (hit.wall.topH + hit.wall.botY) / 2;
                    player.y += (center - player.y) * 0.35;
                }
            } else if (player.hasShield) {
                player.hasShield = false;
                player.invincibleTimer = 60;
                SoundFX.play('shieldBreak');
                triggerScreenShake();
                if (hit.type === 'hazard') {
                    obstacles.hazards.splice(hit.index, 1);
                } else if (hit.type === 'wall') {
                    const center = (hit.wall.topH + hit.wall.botY) / 2;
                    player.y = center;
                }
                updateHUD(player);
            } else {
                triggerGameOver();
            }
        }

        obstacles.draw(ctx, state.isLightModeActive, userSettings.glow);
        items.draw(ctx, state.isLightModeActive, userSettings.glow);
        player.draw(ctx, state.isLightModeActive, userSettings.glow);

    } else if (state.gameState === 'BOOT' || state.gameState === 'LOADING') {
        ctx.fillStyle = state.isLightModeActive ? '#f7f9fc' : '#1e1e1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

    } else {
        drawBackgroundGrid(1);
        obstacles.draw(ctx, state.isLightModeActive, userSettings.glow);
        items.draw(ctx, state.isLightModeActive, userSettings.glow);
        if (state.gameState === 'GAMEOVER') {
            player.draw(ctx, state.isLightModeActive, userSettings.glow);
        }
    }

    requestAnimationFrame(gameLoop);
}

// Inisialisasi Sistem
syncCanvasSize();
initUI(player, startGame);
initInput(startGame);
requestAnimationFrame(gameLoop);