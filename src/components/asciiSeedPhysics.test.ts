import { describe, expect, it } from "vitest";

import { createSeedBody, detachSeed, stepSeed } from "./asciiSeedPhysics";

describe("ASCII seed dynamics", () => {
    it("returns a disturbed attached seed to rest without detaching", () => {
        const body = createSeedBody(1);
        body.angle = 0.45;
        body.angularVelocity = 1.2;
        for (let i = 0; i < 600; i++) stepSeed(body, 1 / 120, i / 120);
        expect(Math.abs(body.angle)).toBeLessThan(0.001);
        expect(Math.abs(body.angularVelocity)).toBeLessThan(0.001);
        expect(body.detachedAt).toBeNull();
    });

    it("gives heavier seeds less initial speed for the same impulse", () => {
        const light = createSeedBody(1);
        const heavy = createSeedBody(1);
        light.mass = 0.8;
        heavy.mass = 1.3;
        detachSeed(light, 0, 0, 0.3, 0.1);
        detachSeed(heavy, 0, 0, 0.3, 0.1);
        expect(light.vx).toBeGreaterThan(heavy.vx);
        expect(light.vx * light.mass).toBeCloseTo(heavy.vx * heavy.mass);
    });

    it("settles into the wind, falls, and recovers gradually", () => {
        const body = createSeedBody(2);
        detachSeed(body, 0, 0, 0.4, 0.2);
        for (let i = 1; i <= 840; i++) stepSeed(body, 1 / 120, i / 120);
        expect(body.vx).toBeLessThan(0.09);
        expect(body.vy).toBeLessThan(0);
        expect(body.opacity).toBeGreaterThan(0);
        expect(body.opacity).toBeLessThan(0.5);
        for (let i = 841; i <= 1200; i++) stepSeed(body, 1 / 120, i / 120);
        expect(body.detachedAt).toBeNull();
        expect(body.x).toBe(0);
        expect(body.opacity).toBeCloseTo(1);
    });

    it("keeps the flight close when the integration step is halved", () => {
        const coarse = createSeedBody(0.7);
        const fine = createSeedBody(0.7);
        detachSeed(coarse, 0, 0.03, 0.3, 0.1);
        detachSeed(fine, 0, 0.03, 0.3, 0.1);
        for (let i = 1; i <= 360; i++) stepSeed(coarse, 1 / 120, i / 120);
        for (let i = 1; i <= 720; i++) stepSeed(fine, 1 / 240, i / 240);
        expect(Math.abs(coarse.x - fine.x)).toBeLessThan(0.002);
        expect(Math.abs(coarse.y - fine.y)).toBeLessThan(0.002);
    });
});
