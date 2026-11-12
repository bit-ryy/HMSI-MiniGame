// Purpose: ObstacleManager class for generating, moving, and detecting collisions with firewalls/bugs
// Used By: main.js
// Depends On: item.js (for synchronized spawning)
// Impact: Dictates the difficulty curve, level generation, and collision hitboxes

export class ObstacleManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.sliceWidth = 50;
        this.walls = [];
        this.hazards = [];
        this.reset();
    }

    resize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    reset() {
        this.walls = [];
        this.hazards = [];
        this.currentCenterY = this.canvasHeight / 2;
        this.currentGap = Math.min(310, Math.max(240, this.canvasHeight * 0.52));
        this.targetCenterY = this.canvasHeight / 2;
        this.segmentsCount = 0;

        const warmupLimit = this.canvasWidth < 600 ? 18 : 35;
        this.warmupSegments = warmupLimit;

        const initialSlices = Math.ceil(this.canvasWidth / this.sliceWidth) + 3;
        for (let i = 0; i < initialSlices; i++) {
            this.addSlice(i * this.sliceWidth, true);
        }
    }

    addSlice(xPos, isSafeStart = false) {
        this.segmentsCount++;
        const isWarmup = isSafeStart || this.segmentsCount <= this.warmupSegments;

        if (!isWarmup) {
            if (this.segmentsCount % 6 === 0) {
                const margin = this.currentGap / 2 + 45;
                this.targetCenterY = margin + Math.random() * Math.max(20, this.canvasHeight - margin * 2);
            }

            const maxStep = 22;
            const diff = this.targetCenterY - this.currentCenterY;
            if (Math.abs(diff) > maxStep) {
                this.currentCenterY += Math.sign(diff) * maxStep;
            } else {
                this.currentCenterY = this.targetCenterY;
            }

            const activeSegments = this.segmentsCount - this.warmupSegments;
            const initialGap = Math.min(310, Math.max(240, this.canvasHeight * 0.52));
            this.currentGap = Math.max(155, initialGap - Math.floor(activeSegments * 0.12));
        }

        const topHeight = Math.max(15, this.currentCenterY - this.currentGap / 2);
        const bottomY = Math.min(this.canvasHeight - 15, this.currentCenterY + this.currentGap / 2);

        this.walls.push({ x: xPos, w: this.sliceWidth, topH: topHeight, botY: bottomY });

        if (this.segmentsCount > this.warmupSegments + 10 && this.segmentsCount % 15 === 0) {
            const offset = (Math.random() - 0.5) * (this.currentGap * 0.40);
            this.hazards.push({
                x: xPos + this.sliceWidth / 2,
                y: this.currentCenterY + offset,
                radius: 17,
                angle: 0
            });
        }
    }

    update(stepSpeed, itemManager, dt = 1) {
        for (let i = 0; i < this.walls.length; i++) {
            this.walls[i].x -= stepSpeed;
        }

        while (this.walls.length > 0 && this.walls[0].x + this.sliceWidth < 0) {
            this.walls.shift();
            const lastX = this.walls[this.walls.length - 1].x;
            const newX = lastX + this.sliceWidth;
            this.addSlice(newX, false);

            if (itemManager) {
                const newest = this.walls[this.walls.length - 1];
                const center = (newest.topH + newest.botY) / 2;
                const gap = newest.botY - newest.topH;
                itemManager.trySpawn(newX, center, gap);
            }
        }

        for (let i = this.hazards.length - 1; i >= 0; i--) {
            this.hazards[i].x -= stepSpeed;
            this.hazards[i].angle += 0.08 * dt;
            if (this.hazards[i].x < -50) {
                this.hazards.splice(i, 1);
            }
        }
    }

    draw(ctx, isLightMode = false, glowEnabled = true) {
        ctx.save();
        const wallFill = isLightMode ? '#dfe4ea' : '#181818';
        const rackStroke = isLightMode ? '#ced6e0' : '#262626';
        const neonRed = isLightMode ? '#cf222e' : '#f44747';

        ctx.fillStyle = wallFill;
        ctx.lineWidth = 2;

        for (const w of this.walls) {
            ctx.fillRect(w.x, 0, w.w + 1, w.topH);
            ctx.fillRect(w.x, w.botY, w.w + 1, this.canvasHeight - w.botY);
            ctx.strokeStyle = rackStroke;
            ctx.strokeRect(w.x, 0, w.w, w.topH);
            ctx.strokeRect(w.x, w.botY, w.w, this.canvasHeight - w.botY);
        }

        if (this.walls.length > 1) {
            ctx.strokeStyle = neonRed;
            ctx.lineWidth = 2.5;
            if (glowEnabled) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = neonRed;
            }

            ctx.beginPath();
            for (let i = 0; i < this.walls.length; i++) {
                const w = this.walls[i];
                if (i === 0) ctx.moveTo(w.x, w.topH);
                else ctx.lineTo(w.x, w.topH);
                ctx.lineTo(w.x + w.w, w.topH);
            }
            ctx.stroke();

            ctx.beginPath();
            for (let i = 0; i < this.walls.length; i++) {
                const w = this.walls[i];
                if (i === 0) ctx.moveTo(w.x, w.botY);
                else ctx.lineTo(w.x, w.botY);
                ctx.lineTo(w.x + w.w, w.botY);
            }
            ctx.stroke();
        }

        for (const h of this.hazards) {
            ctx.save();
            ctx.translate(h.x, h.y);
            ctx.rotate(h.angle);

            if (glowEnabled) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = neonRed;
            }
            ctx.fillStyle = neonRed;

            const teeth = 8;
            ctx.beginPath();
            for (let i = 0; i < teeth * 2; i++) {
                const r = i % 2 === 0 ? h.radius : h.radius - 6;
                const a = (i * Math.PI) / teeth;
                const px = Math.cos(a) * r;
                const py = Math.sin(a) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = isLightMode ? '#f7f9fc' : '#1e1e1e';
            ctx.beginPath();
            ctx.arc(0, 0, h.radius - 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }

    checkCollision(player) {
        const hitRadius = player.radius - 2;

        for (const w of this.walls) {
            if (player.x + hitRadius > w.x && player.x - hitRadius < w.x + w.w) {
                if (player.y - hitRadius < w.topH || player.y + hitRadius > w.botY) {
                    return { type: 'wall', wall: w };
                }
            }
        }

        for (let i = 0; i < this.hazards.length; i++) {
            const h = this.hazards[i];
            const dist = Math.hypot(player.x - h.x, player.y - h.y);
            if (dist < hitRadius + h.radius - 3) {
                return { type: 'hazard', index: i };
            }
        }

        return null;
    }
}