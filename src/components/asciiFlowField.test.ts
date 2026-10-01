import { describe, expect, it } from "vitest";

import { AsciiFlowField } from "./asciiFlowField";

describe("ASCII hover flow", () => {
    it("deposits the whole mouse sweep immediately, including its leading cell", () => {
        const flow = new AsciiFlowField(320, 200);
        flow.stir(248, 90, 192, 0, 60);
        const row = Math.floor(90 / flow.cellHeight);
        expect(flow.density[row * flow.columns + 15]).toBeGreaterThan(0.5);
        expect(flow.density[row * flow.columns + 9]).toBeGreaterThan(0.5);
        expect(flow.vx[row * flow.columns + 9]).toBeGreaterThan(0);
    });

    it("preserves momentum when the pointer stops and carries the density forward", () => {
        const flow = new AsciiFlowField(800, 320);
        const centerX = () => {
            let total = 0;
            let weighted = 0;
            for (let i = 0; i < flow.density.length; i++) {
                total += flow.density[i];
                weighted += flow.density[i] * ((i % flow.columns) + 0.5) * flow.cellWidth;
            }
            return weighted / total;
        };
        flow.stir(400, 160, 120, 0, 80);
        const initialX = centerX();
        const cell = Math.floor(160 / flow.cellHeight) * flow.columns + Math.floor(360 / flow.cellWidth);
        const velocity = flow.vx[cell];
        flow.stir(360, 160, 0, 0, 16);
        expect(flow.vx[cell]).toBe(velocity);
        for (let i = 0; i < 60; i++) flow.step(1 / 60);
        const afterOneSecond = centerX();
        expect(afterOneSecond).toBeGreaterThan(initialX + 8);
        for (let i = 0; i < 60; i++) flow.step(1 / 60);
        expect(centerX()).toBeGreaterThan(afterOneSecond + 2);
    });

    it("lets the ribbon dissolve without a sudden reset", () => {
        const flow = new AsciiFlowField(240, 160);
        flow.stir(120, 80, 0, 0, 16);
        const initial = Math.max(...flow.density);
        for (let i = 0; i < 60; i++) flow.step(1 / 60);
        const middle = Math.max(...flow.density);
        expect(middle).toBeGreaterThan(0.1);
        expect(middle).toBeLessThan(initial);
        for (let i = 0; i < 240; i++) flow.step(1 / 60);
        expect(Math.max(...flow.density)).toBeLessThan(0.02);
    });

    it("stays finite and bounded during repeated rapid reversals at the edges", () => {
        const flow = new AsciiFlowField(240, 160);
        for (let i = 0; i < 120; i++) {
            flow.stir(i % 2 ? 220 : 20, i % 3 ? 140 : 20, i % 2 ? 200 : -200, 80, 8);
            flow.step(1 / 60);
        }
        expect([...flow.density, ...flow.vx, ...flow.vy].every(Number.isFinite)).toBe(true);
        expect(Math.max(...flow.density)).toBeLessThanOrEqual(1.02);
        expect(Math.max(...flow.vx.map(Math.abs))).toBeLessThan(25);
        expect(Math.min(...flow.density)).toBeGreaterThanOrEqual(0);
    });
});
