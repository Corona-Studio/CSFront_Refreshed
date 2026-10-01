export class AsciiFlowField {
    readonly columns: number;
    readonly rows: number;
    readonly density: Float32Array;
    readonly vx: Float32Array;
    readonly vy: Float32Array;
    private readonly nextDensity: Float32Array;
    private readonly nextVx: Float32Array;
    private readonly nextVy: Float32Array;
    private readonly pressure: Float32Array;
    private readonly divergence: Float32Array;
    private readonly curl: Float32Array;

    constructor(
        readonly width: number,
        readonly height: number,
        readonly cellWidth = 16,
        readonly cellHeight = 20
    ) {
        this.columns = Math.ceil(width / cellWidth);
        this.rows = Math.ceil(height / cellHeight);
        const length = this.columns * this.rows;
        this.density = new Float32Array(length);
        this.vx = new Float32Array(length);
        this.vy = new Float32Array(length);
        this.nextDensity = new Float32Array(length);
        this.nextVx = new Float32Array(length);
        this.nextVy = new Float32Array(length);
        this.pressure = new Float32Array(length);
        this.divergence = new Float32Array(length);
        this.curl = new Float32Array(length);
    }

    private index(x: number, y: number) {
        return Math.max(0, Math.min(this.rows - 1, y)) * this.columns + Math.max(0, Math.min(this.columns - 1, x));
    }

    private sample(field: Float32Array, x: number, y: number) {
        x = Math.max(0, Math.min(this.columns - 1, x));
        y = Math.max(0, Math.min(this.rows - 1, y));
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const tx = x - ix;
        const ty = y - iy;
        return (
            (field[this.index(ix, iy)] * (1 - tx) + field[this.index(ix + 1, iy)] * tx) * (1 - ty) +
            (field[this.index(ix, iy + 1)] * (1 - tx) + field[this.index(ix + 1, iy + 1)] * tx) * ty
        );
    }

    stir(x: number, y: number, dx: number, dy: number, duration: number) {
        const distance = Math.hypot(dx, dy);
        const speed = Math.min(2.5, distance / Math.max(duration, 8));
        const radius = 28 + speed * 9;
        const minX = Math.max(0, Math.floor((Math.min(x, x - dx) - radius * 2) / this.cellWidth));
        const maxX = Math.min(this.columns - 1, Math.ceil((Math.max(x, x - dx) + radius * 2) / this.cellWidth));
        const minY = Math.max(0, Math.floor((Math.min(y, y - dy) - radius * 2) / this.cellHeight));
        const maxY = Math.min(this.rows - 1, Math.ceil((Math.max(y, y - dy) + radius * 2) / this.cellHeight));
        const forceX = Math.max(-22, Math.min(22, ((dx / Math.max(duration, 8)) * 200) / this.cellWidth));
        const forceY = Math.max(-22, Math.min(22, ((dy / Math.max(duration, 8)) * 200) / this.cellHeight));
        const impulse = (1 - Math.exp(-Math.min(duration, 40) / 32)) * 0.45;
        for (let row = minY; row <= maxY; row++) {
            for (let col = minX; col <= maxX; col++) {
                const px = (col + 0.5) * this.cellWidth - (x - dx);
                const py = (row + 0.5) * this.cellHeight - (y - dy);
                const t = distance > 0 ? Math.max(0, Math.min(1, (px * dx + py * dy) / (distance * distance))) : 1;
                const falloff = Math.exp(-((px - dx * t) ** 2 + (py - dy * t) ** 2) / (radius * radius));
                const i = this.index(col, row);
                // Deposit a continuous ribbon, including the current pointer cell, without a reveal delay.
                this.density[i] = Math.max(this.density[i], falloff * (0.42 + speed * 0.07));
                // Input adds momentum instead of steering velocity to the current mouse speed.
                // Slowing or stopping the pointer therefore does not brake the existing wake.
                this.vx[i] = Math.max(-22, Math.min(22, this.vx[i] + forceX * falloff * impulse));
                this.vy[i] = Math.max(-22, Math.min(22, this.vy[i] + forceY * falloff * impulse));
            }
        }
    }

    step(dt: number) {
        dt = Math.min(dt, 1 / 30);
        const drag = Math.exp(-dt * 0.38);
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const i = this.index(x, y);
                const sx = x - this.vx[i] * dt;
                const sy = y - this.vy[i] * dt;
                this.nextVx[i] = this.sample(this.vx, sx, sy) * drag;
                this.nextVy[i] = this.sample(this.vy, sx, sy) * drag;
            }
        }
        this.vx.set(this.nextVx);
        this.vy.set(this.nextVy);
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                this.curl[this.index(x, y)] =
                    (this.vy[this.index(x + 1, y)] -
                        this.vy[this.index(x - 1, y)] -
                        this.vx[this.index(x, y + 1)] +
                        this.vx[this.index(x, y - 1)]) *
                    0.5;
            }
        }
        this.pressure.fill(0);
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const i = this.index(x, y);
                const gx = Math.abs(this.curl[this.index(x + 1, y)]) - Math.abs(this.curl[this.index(x - 1, y)]);
                const gy = Math.abs(this.curl[this.index(x, y + 1)]) - Math.abs(this.curl[this.index(x, y - 1)]);
                const length = Math.hypot(gx, gy) + 0.001;
                this.vx[i] += (gy / length) * this.curl[i] * dt * 0.3;
                this.vy[i] -= (gx / length) * this.curl[i] * dt * 0.3;
            }
        }
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                this.divergence[this.index(x, y)] =
                    (this.vx[this.index(x + 1, y)] -
                        this.vx[this.index(x - 1, y)] +
                        this.vy[this.index(x, y + 1)] -
                        this.vy[this.index(x, y - 1)]) *
                    0.5;
            }
        }
        // Pressure projection keeps the wake flowing around itself rather than stretching into a line.
        for (let iteration = 0; iteration < 8; iteration++) {
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.columns; x++) {
                    const i = this.index(x, y);
                    this.pressure[i] =
                        (this.pressure[this.index(x - 1, y)] +
                            this.pressure[this.index(x + 1, y)] +
                            this.pressure[this.index(x, y - 1)] +
                            this.pressure[this.index(x, y + 1)] -
                            this.divergence[i]) /
                        4;
                }
            }
        }
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const i = this.index(x, y);
                this.vx[i] -= (this.pressure[this.index(x + 1, y)] - this.pressure[this.index(x - 1, y)]) * 0.5;
                this.vy[i] -= (this.pressure[this.index(x, y + 1)] - this.pressure[this.index(x, y - 1)]) * 0.5;
                if (x === 0 || x === this.columns - 1) this.vx[i] = 0;
                if (y === 0 || y === this.rows - 1) this.vy[i] = 0;
            }
        }
        const fade = Math.exp(-dt * 0.72);
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const i = this.index(x, y);
                this.nextDensity[i] = this.sample(this.density, x - this.vx[i] * dt, y - this.vy[i] * dt) * fade;
            }
        }
        this.density.set(this.nextDensity);
    }
}
