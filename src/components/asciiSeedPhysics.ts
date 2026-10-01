export type SeedBody = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    angularVelocity: number;
    mass: number;
    phase: number;
    detachedAt: number | null;
    releaseSway: number;
    releaseAngle: number;
    opacity: number;
};

export function createSeedBody(phase: number): SeedBody {
    return {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        angle: 0,
        angularVelocity: 0,
        mass: 0.8 + (Math.sin(phase * 7.3) + 1) * 0.25,
        phase,
        detachedAt: null,
        releaseSway: 0,
        releaseAngle: 0,
        opacity: 1
    };
}

export function flowerSway(time: number, phase: number) {
    return Math.sin(time * 0.65 + phase) * 0.035 + Math.sin(time * 0.32 + phase * 2) * 0.015;
}

export function detachSeed(body: SeedBody, time: number, sway: number, vx: number, vy: number) {
    if (body.detachedAt !== null || body.opacity < 0.98) return;
    body.detachedAt = time;
    body.releaseSway = sway;
    body.releaseAngle = body.angle;
    body.vx = vx / body.mass;
    body.vy = vy / body.mass;
    body.angularVelocity += (vx * Math.sin(body.phase) - vy * Math.cos(body.phase)) * 2.4;
}

// Semi-implicit Euler at a fixed 120 Hz: stable spring damping and frame-rate independent drag.
export function stepSeed(body: SeedBody, dt: number, time: number, torque = 0) {
    if (body.detachedAt === null) {
        body.angularVelocity += (torque / body.mass - 42 * body.angle - 9 * body.angularVelocity) * dt;
        body.angle += body.angularVelocity * dt;
        body.opacity = Math.min(1, body.opacity + dt * 0.55);
        return;
    }
    const age = time - body.detachedAt;
    if (age > 8) {
        body.x = body.y = body.vx = body.vy = body.angle = body.angularVelocity = 0;
        body.detachedAt = null;
        body.opacity = 0;
        return;
    }
    // Each seed samples a spatial wind field; air drag gradually replaces the cut impulse.
    const windX = 0.045 + Math.sin(time * 0.7 + body.y * 5 + body.phase) * 0.025;
    const windY = Math.cos(time * 0.5 + body.x * 6 + body.phase) * 0.018;
    const drag = 1.35 / body.mass;
    body.vx += (windX - body.vx) * drag * dt;
    body.vy += ((windY - body.vy) * drag - 0.038 * body.mass) * dt;
    body.x += body.vx * dt;
    body.y += body.vy * dt;
    const windTorque = Math.sin(time * 0.9 + body.phase + body.x * 3) * 0.22;
    body.angularVelocity += (windTorque - body.angularVelocity * 1.9) * dt;
    body.angle += body.angularVelocity * dt;
    const fade = Math.max(0, Math.min(1, (age - 5) / 3));
    body.opacity = 1 - fade * fade * (3 - 2 * fade);
}
