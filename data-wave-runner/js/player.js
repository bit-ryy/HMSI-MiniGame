// Purpose: Player class definition (wave movement, rendering, and trail logic)
// Used By: main.js
// Depends On: None
// Impact: Controls the physics behavior and visual drawing of the player's data node

export class Player {
    constructor(canvasWidth, canvasHeight) {
        this.radius = 9;
        this.angle = 0;
        this.trail = [];
        this.hasShield = false;
        this.invincibleTimer = 0;
        this.turboTimer = 0;
        this.vyMultiplier = 0.68;
        this.maxAngle = 0.60;
        this.resize(canvasWidth, canvasHeight);
        this.y = canvasHeight / 2;
    }

    resize(canvasWidth, canvasHeight) {
        this.x = Math.min(160, Math.max(85, Math.round(canvasWidth * 0.22)));
        this.y = Math.min(Math.max(this.y || canvasHeight / 2, 30), canvasHeight - 30);
    }

    setAnglePreset(mode) {
        if (mode === 'aggressive') {
            this.vyMultiplier = 1.0;
            this.maxAngle = Math.PI / 4;
        } else {
            this.vyMultiplier = 0.68;
            this.maxAngle = 0.60;
        }
    }

    reset(canvasWidth, canvasHeight) {
        this.resize(canvasWidth, canvasHeight);
        this.y = canvasHeight / 2;
        this.angle = 0;
        this.trail = [];
        this.hasShield = false;
        this.invincibleTimer = 0;
        this.turboTimer = 0;
    }

    update(isHolding, stepSpeed, dt = 1) {
        const vy = (isHolding ? -stepSpeed : stepSpeed) * this.vyMultiplier;
        this.y += vy;

        const targetAngle = isHolding ? -this.maxAngle : this.maxAngle;
        const turnFactor = 1 - Math.pow(1 - 0.25, dt);
        this.angle += (targetAngle - this.angle) * turnFactor;

        for (let i = 0; i < this.trail.length; i++) {
            this.trail[i].x -= stepSpeed;
        }
        this.trail.push({ x: this.x, y: this.y });

        while (this.trail.length > 0 && this.trail[0].x < -20) {
            this.trail.shift();
        }

        if (this.invincibleTimer > 0) this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);
        if (this.turboTimer > 0) this.turboTimer = Math.max(0, this.turboTimer - dt);
    }

    draw(ctx, isLightMode = false, glowEnabled = true) {
        ctx.save();
        const defaultCyan = isLightMode ? '#0969da' : '#4fc1ff';
        const mainColor = this.turboTimer > 0 ? '#ce9178' : defaultCyan;

        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = mainColor;
            ctx.lineWidth = this.turboTimer > 0 ? 5 : 3.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            if (glowEnabled) {
                ctx.shadowBlur = 12;
                ctx.shadowColor = mainColor;
            }
            ctx.stroke();
        }

        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
            ctx.restore();
            return;
        }

        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        if (glowEnabled) {
            ctx.shadowBlur = 14;
            ctx.shadowColor = mainColor;
        }
        ctx.fillStyle = isLightMode ? '#1f2328' : '#ffffff';

        ctx.beginPath();
        ctx.moveTo(13, 0);
        ctx.lineTo(-9, -8);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-9, 8);
        ctx.closePath();
        ctx.fill();

        if (this.hasShield) {
            ctx.rotate(-this.angle);
            ctx.beginPath();
            ctx.arc(0, 0, 17, 0, Math.PI * 2);
            ctx.strokeStyle = isLightMode ? '#1a7f37' : '#4ec9b0';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }
}