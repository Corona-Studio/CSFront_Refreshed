import { AsciiFlowField } from "./asciiFlowField";

const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

/** An advected dye field driven by smoothly drifting, randomized vortices. */
export class AsciiFluidSimulation {
    readonly flow: AsciiFlowField;
    readonly foam: Float32Array;
    time = 0;
    private readonly nextFoam: Float32Array;
    private readonly vortices: {
        x: number;
        y: number;
        radius: number;
        phase: number;
        speed: number;
        strength: number;
        direction: number;
    }[];

    constructor(
        readonly width: number,
        readonly height: number,
        cellWidth = 9,
        cellHeight = 13,
        readonly randomForces = true,
        random: () => number = Math.random
    ) {
        this.flow = new AsciiFlowField(width, height, cellWidth, cellHeight);
        this.foam = new Float32Array(this.flow.columns * this.flow.rows);
        this.nextFoam = new Float32Array(this.foam.length);
        this.vortices = Array.from({ length: 6 }, (_, i) => ({
            x: 0.16 + (i % 3) * 0.33 + (random() - 0.5) * 0.09,
            y: 0.28 + Math.floor(i / 3) * 0.45 + (random() - 0.5) * 0.09,
            radius: 0.19 + random() * 0.09,
            phase: random() * Math.PI * 2,
            speed: 0.17 + random() * 0.16,
            strength: 16 + random() * 10,
            direction: i % 2 ? -1 : 1
        }));
        if (randomForces) {
            // Start with two broad swirls of dye so the background is alive on first paint.
            for (let row = 0; row < this.flow.rows; row++) {
                for (let col = 0; col < this.flow.columns; col++) {
                    const nx = (col + 0.5) / this.flow.columns;
                    const ny = (row + 0.5) / this.flow.rows;
                    const ribbon = Math.sin(nx * 7 + Math.cos(ny * 5) * 1.8);
                    this.flow.density[row * this.flow.columns + col] = 0.13 + Math.exp(-ribbon * ribbon * 10) * 0.42;
                }
            }
            this.applyRandomForces(0.25);
        }
    }

    stir(x: number, y: number, dx: number, dy: number, duration: number) {
        this.flow.stir(x, y, dx, dy, duration);
    }

    private applyRandomForces(dt: number) {
        if (!this.randomForces) return;
        const flow = this.flow;
        for (const vortex of this.vortices) {
            const cx = (vortex.x + Math.sin(this.time * 0.14 + vortex.phase) * 0.12) * this.width;
            const cy = (vortex.y + Math.cos(this.time * 0.17 + vortex.phase) * 0.11) * this.height;
            const radius = Math.min(this.width, this.height) * vortex.radius;
            const force =
                vortex.strength * vortex.direction * (0.65 + Math.sin(this.time * vortex.speed + vortex.phase) * 0.35);
            for (let row = 0; row < flow.rows; row++) {
                for (let col = 0; col < flow.columns; col++) {
                    const dx = ((col + 0.5) * flow.cellWidth - cx) / radius;
                    const dy = ((row + 0.5) * flow.cellHeight - cy) / radius;
                    const falloff = Math.exp(-(dx * dx + dy * dy) * 1.6);
                    const i = row * flow.columns + col;
                    flow.vx[i] = clamp(flow.vx[i] - dy * falloff * force * dt, -22, 22);
                    flow.vy[i] = clamp(flow.vy[i] + dx * falloff * force * dt, -22, 22);
                    // Feed dye along a curved ribbon rather than filling every vortex uniformly.
                    const ribbon = Math.exp(-Math.pow(Math.hypot(dx, dy) - 0.7, 2) * 24);
                    flow.density[i] = Math.min(0.95, flow.density[i] + ribbon * dt * 0.42);
                }
            }
        }
    }

    step(dt: number) {
        dt = clamp(dt, 0, 1 / 60);
        this.time += dt;
        this.applyRandomForces(dt);
        this.flow.step(dt);
        const flow = this.flow;
        const at = (x: number, y: number) => clamp(y, 0, flow.rows - 1) * flow.columns + clamp(x, 0, flow.columns - 1);
        for (let row = 0; row < flow.rows; row++) {
            for (let col = 0; col < flow.columns; col++) {
                const i = at(col, row);
                const x = clamp(col - flow.vx[i] * dt, 0, flow.columns - 1);
                const y = clamp(row - flow.vy[i] * dt, 0, flow.rows - 1);
                const ix = Math.floor(x);
                const iy = Math.floor(y);
                const tx = x - ix;
                const ty = y - iy;
                const advected =
                    (this.foam[at(ix, iy)] * (1 - tx) + this.foam[at(ix + 1, iy)] * tx) * (1 - ty) +
                    (this.foam[at(ix, iy + 1)] * (1 - tx) + this.foam[at(ix + 1, iy + 1)] * tx) * ty;
                const curl =
                    Math.abs(
                        flow.vy[at(col + 1, row)] -
                            flow.vy[at(col - 1, row)] -
                            flow.vx[at(col, row + 1)] +
                            flow.vx[at(col, row - 1)]
                    ) * 0.5;
                const speed = Math.hypot(flow.vx[i], flow.vy[i]);
                const churn = Math.max(0, curl - 0.3) * flow.density[i] + Math.max(0, speed - 5) * 0.025;
                this.nextFoam[i] = clamp(advected * Math.exp(-dt * 1.1) + churn * dt * 0.7, 0, 1);
            }
        }
        this.foam.set(this.nextFoam);
    }
}
