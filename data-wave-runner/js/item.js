// Purpose: ItemManager class for spawning and managing collectible power-ups (Data, Shield, Overclock)
// Used By: main.js, obstacle.js
// Depends On: None
// Impact: Handles the lifecycle, rendering, and collision logic of all positive pick-ups

export class ItemManager {
    constructor() {
        this.items = [];
        this.spawnCounter = 0;
    }

    reset() {
        this.items = [];
        this.spawnCounter = 0;
    }

    trySpawn(x, centerY, gap) {
        this.spawnCounter++;
        if (this.spawnCounter % 8 !== 0) return;

        const rand = Math.random();
        let type = 'data';
        if (rand > 0.88) type = 'turbo';
        else if (rand > 0.70) type = 'shield';

        const offsetY = (Math.random() - 0.5) * (gap * 0.5);

        this.items.push({
            x: x,
            y: centerY + offsetY,
            type: type,
            radius: 12,
            bitLabel: Math.random() > 0.5 ? '1' : '0'
        });
    }

    update(gameSpeed, player, onCollect) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.x -= gameSpeed;

            const dist = Math.hypot(player.x - item.x, player.y - item.y);
            if (dist < player.radius + item.radius + 4) {
                onCollect(item.type);
                this.items.splice(i, 1);
                continue;
            }

            if (item.x < -30) {
                this.items.splice(i, 1);
            }
        }
    }

    draw(ctx, isLightMode = false, glowEnabled = true) {
        ctx.save();
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textColor = isLightMode ? '#1f2328' : '#ffffff';

        for (const item of this.items) {
            ctx.save();
            ctx.translate(item.x, item.y);

            if (item.type === 'data') {
                const c = isLightMode ? '#1a7f37' : '#4ec9b0';
                if (glowEnabled) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = c;
                }
                ctx.strokeStyle = c;
                ctx.fillStyle = 'rgba(78, 201, 176, 0.22)';
                ctx.lineWidth = 2;
                ctx.strokeRect(-10, -10, 20, 20);
                ctx.fillRect(-10, -10, 20, 20);
                ctx.fillStyle = textColor;
                ctx.fillText(item.bitLabel, 0, 1);
            } else if (item.type === 'shield') {
                const c = isLightMode ? '#0969da' : '#569cd6';
                if (glowEnabled) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = c;
                }
                ctx.strokeStyle = c;
                ctx.fillStyle = 'rgba(86, 156, 214, 0.25)';
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.moveTo(0, -13);
                ctx.lineTo(13, 0);
                ctx.lineTo(0, 13);
                ctx.lineTo(-13, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = textColor;
                ctx.fillText('S', 0, 1);
            } else if (item.type === 'turbo') {
                const c = isLightMode ? '#bc4c00' : '#ce9178';
                if (glowEnabled) {
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = c;
                }
                ctx.strokeStyle = c;
                ctx.fillStyle = 'rgba(206, 145, 120, 0.28)';
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = textColor;
                ctx.fillText('⚡', 0, 1);
            }

            ctx.restore();
        }

        ctx.restore();
    }
}