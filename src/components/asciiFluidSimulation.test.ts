import { describe, expect, it } from "vitest";

import { AsciiFluidSimulation } from "./asciiFluidSimulation";

const advance = (simulation: AsciiFluidSimulation, seconds: number) => {
    for (let i = 0; i < seconds * 60; i++) simulation.step(1 / 60);
};
const random = () => 0.4;

describe("ASCII fluid background", () => {
    it("starts with visible dye and keeps the field moving without input", () => {
        const simulation = new AsciiFluidSimulation(320, 240, 9, 13, true, random);
        const initial = Array.from(simulation.flow.density);
        expect(Math.max(...initial)).toBeGreaterThan(0.3);
        advance(simulation, 5);
        expect(simulation.flow.density.some((d, i) => Math.abs(d - initial[i]) > 0.1)).toBe(true);
        expect(Math.max(...simulation.flow.vx.map(Math.abs))).toBeGreaterThan(0.5);
        expect(Math.max(...simulation.foam)).toBeGreaterThan(0);
    });

    it("adds mouse momentum and lets the wake dissipate when forcing is off", () => {
        const simulation = new AsciiFluidSimulation(320, 240, 9, 13, false);
        simulation.stir(180, 120, 100, 30, 40);
        expect(Math.max(...simulation.flow.density)).toBeGreaterThan(0.5);
        expect(Math.max(...simulation.flow.vx)).toBeGreaterThan(0);
        advance(simulation, 2);
        expect(Math.max(...simulation.flow.density)).toBeGreaterThan(0.02);
        advance(simulation, 8);
        expect(Math.max(...simulation.flow.density)).toBeLessThan(0.01);
    });

    it("stays finite and bounded during randomized forcing and repeated edge reversals", () => {
        const simulation = new AsciiFluidSimulation(240, 180, 9, 13, true, random);
        for (let i = 0; i < 360; i++) {
            simulation.stir(i % 2 ? 10 : 230, i % 3 ? 170 : 10, i % 2 ? -180 : 180, 80, 8);
            simulation.step(1 / 60);
        }
        expect(
            [...simulation.flow.density, ...simulation.flow.vx, ...simulation.flow.vy, ...simulation.foam].every(
                Number.isFinite
            )
        ).toBe(true);
        expect(Math.max(...simulation.flow.density)).toBeLessThanOrEqual(1);
        expect(Math.min(...simulation.flow.density)).toBeGreaterThanOrEqual(0);
        expect(Math.max(...simulation.foam)).toBeLessThanOrEqual(1);
    });
});
