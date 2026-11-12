// Purpose: Primary entry point and system initialization
// Used By: index.html
// Depends On: ui.js, input.js, game.js
// Impact: Bootstraps the application by wiring up the UI and input modules to start the game

import { initUI } from './ui.js';
import { initInput } from './input.js';
import { startCountdown } from './game.js';

// Inisialisasi Sistem Whack-a-Bug
initUI(startCountdown);
initInput();