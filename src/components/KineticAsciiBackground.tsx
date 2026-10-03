"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import styles from "./KineticAsciiBackground.module.css";
import { AsciiFlowField } from "./asciiFlowField";
import { type SeedBody, createSeedBody, detachSeed, flowerSway, stepSeed } from "./asciiSeedPhysics";

const glyphs = " /\\>*.:[]{}<%&01+=#^i";
const vertexShader = `
    attribute vec2 aCenter;
    attribute vec2 aAnchor;
    attribute float aGlyph;
    attribute float aColor;
    attribute float aSpeed;
    attribute float aKind;
    attribute float aScale;
    attribute vec4 aMotion;
    attribute vec3 aPose;
    attribute vec2 aPivot;
    uniform vec2 uViewport;
    uniform float uTime;
    uniform float uSize;
    varying vec2 vUv;
    varying float vGlyph;
    varying float vColor;
    varying float vOpacity;
    void main() {
        vUv = uv;
        vGlyph = aGlyph;
        vColor = aColor;
        float aspect = uViewport.x / uViewport.y;
        vec2 offset = aCenter;
        vec2 anchor = aAnchor;
        float sway = sin(uTime * 0.65 + aSpeed) * 0.035 + sin(uTime * 0.32 + aSpeed * 2.0) * 0.015;
        if (aKind < 0.5) {
            // A restrained blue character field establishes a graphic, flat backdrop.
            anchor.x = mod(anchor.x + uTime * 0.009 + 1.2, 2.4) - 1.2;
            vOpacity = 0.28;
        } else if (aKind > 2.5) {
            // Detached seeds drift on the same wind as the radial flowers.
            anchor.x = mod(anchor.x + uTime * 0.025 + 1.3, 2.6) - 1.3;
            anchor.y += sin(uTime * 0.4 + aSpeed) * 0.08;
            vOpacity = 0.8;
        } else {
            float angle = sway * (aKind > 1.5 ? 0.15 : 1.0);
            mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            offset = rotation * offset;
            // More movement towards the crown, while the bottom of the stem stays rooted.
            offset.x += sway * (aKind > 1.5 ? max(0.0, offset.y + 0.9) : 1.0);
            vOpacity = aKind > 1.5 ? 0.65 : 0.95;
        }
        float turn = 0.0;
        if (aKind > 0.5 && aKind < 1.5) {
            // Attached filaments pivot on a damped spring; free seeds rotate about their center of mass.
            float angle = aMotion.z;
            mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            vec2 root = aPivot * (0.625 / 0.84);
            if (aPose.x > 0.5) {
                mat2 release = mat2(cos(aPose.z), -sin(aPose.z), sin(aPose.z), cos(aPose.z));
                mat2 wind = mat2(cos(aPose.y), -sin(aPose.y), sin(aPose.y), cos(aPose.y));
                offset = wind * (rotation * (aCenter - aPivot) + release * (aPivot - root) + root);
                offset += vec2(aPose.y, 0.0) + aMotion.xy;
                turn = angle + aPose.y;
            } else if (length(aPivot) > 0.0) {
                mat2 wind = mat2(cos(sway), -sin(sway), sin(sway), cos(sway));
                offset = wind * (rotation * (aCenter - root) + root) + vec2(sway, 0.0);
            }
            vOpacity *= aMotion.w;
        }
        vec2 p = anchor + vec2(offset.x / aspect, offset.y);
        vec2 size = vec2(uSize, uSize) / uViewport * 2.0;
        mat2 spin = mat2(cos(turn), -sin(turn), sin(turn), cos(turn));
        gl_Position = vec4(p + (spin * position.xy) * size * aScale, 0.0, 1.0);
    }
`;
const fragmentShader = `
    uniform sampler2D uAtlas;
    uniform float uGlyphCount;
    varying vec2 vUv;
    varying float vGlyph;
    varying float vColor;
    varying float vOpacity;
    void main() {
        float ink = texture2D(uAtlas, vec2((vUv.x + vGlyph) / uGlyphCount, vUv.y)).a;
        vec3 color = vColor < 0.5 ? vec3(0.045, 0.19, 0.78)
            : vColor < 1.5 ? vec3(0.42, 0.86, 0.63)
            : vColor < 2.5 ? vec3(0.08, 0.48, 0.36)
            : vColor < 3.5 ? vec3(1.0, 0.005, 0.045)
            : vec3(0.86, 0.88, 0.84);
        gl_FragColor = vec4(color, ink * vOpacity);
        #include <colorspace_fragment>
    }
`;

export default function KineticAsciiBackground({ variant = "hero" }: { variant?: "hero" | "login" }) {
    const hostRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        } catch {
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        host.appendChild(renderer.domElement);
        const flowCanvas = document.createElement("canvas");
        flowCanvas.className = styles.flow;
        host.appendChild(flowCanvas);
        const flowContext = flowCanvas.getContext("2d");
        let flow: AsciiFlowField | null = null;
        let flowActiveUntil = 0;
        let flowAccumulator = 0;
        const seeds: {
            indices: number[];
            x: number;
            y: number;
            ax: number;
            ay: number;
            phase: number;
            body: SeedBody;
        }[] = [];
        const scene = new THREE.Scene();
        const camera = new THREE.Camera();
        const atlasCanvas = document.createElement("canvas");
        atlasCanvas.width = glyphs.length * 64;
        atlasCanvas.height = 64;
        const context = atlasCanvas.getContext("2d");
        if (context) {
            context.fillStyle = "white";
            context.font = "bold 52px monospace";
            context.textAlign = "center";
            context.textBaseline = "middle";
            [...glyphs].forEach((glyph, index) => context.fillText(glyph, index * 64 + 32, 32));
        }
        const atlas = new THREE.CanvasTexture(atlasCanvas);
        atlas.minFilter = THREE.LinearFilter;
        atlas.magFilter = THREE.LinearFilter;
        const centers: number[] = [];
        const anchors: number[] = [];
        const glyphIndices: number[] = [];
        const colors: number[] = [];
        const speeds: number[] = [];
        const kinds: number[] = [];
        const scales: number[] = [];
        const addGlyph = (
            x: number,
            y: number,
            ax: number,
            ay: number,
            glyph: string,
            color: number,
            phase: number,
            kind: number,
            scale: number
        ) => {
            centers.push(x, y);
            anchors.push(ax, ay);
            glyphIndices.push(glyphs.indexOf(glyph));
            colors.push(color);
            speeds.push(phase);
            kinds.push(kind);
            scales.push(scale);
        };
        // Sparse, small blue marks — a texture, not a wall of readable source code.
        for (let row = 0; row < 18; row++) {
            for (let column = 0; column < 55; column++) {
                if ((column * 7 + row * 11) % 9 < 3) continue;
                const symbol = [":", ".", "/", "0", "1"][(column + row * 3) % 5];
                addGlyph(0, 0, (column / 54) * 2.4 - 1.2, (row - 8.5) * 0.09, symbol, 0, row, 0, 0.32);
            }
        }
        // Three different-sized seed heads: dots form the radial structure, punctuation the tips.
        const flowers = [
            { x: variant === "login" ? -0.15 : 0.42, y: 0.08, radius: 0.43, phase: 0.2 },
            { x: variant === "login" ? 0.62 : 0.92, y: 0.54, radius: 0.25, phase: 2.1 },
            { x: variant === "login" ? 0.62 : 0.96, y: -0.52, radius: 0.32, phase: 4.4 }
        ];
        flowers.forEach(({ x, y, radius, phase }, flowerIndex) => {
            for (let ray = 0; ray < 28; ray++) {
                const angle = (ray / 28) * Math.PI * 2;
                const radiusVariation = radius * (0.94 + Math.sin(ray * 2.7) * 0.055);
                let first = kinds.length;
                for (let step = 3; step <= 15; step++) {
                    if (step === 11) first = kinds.length;
                    const r = (radiusVariation * step) / 16;
                    addGlyph(
                        Math.cos(angle) * r,
                        Math.sin(angle) * r,
                        x,
                        y,
                        ".",
                        step % 4 === 0 ? 1 : 2,
                        phase,
                        1,
                        0.48
                    );
                }
                const tip = ["+", "*", "+", "*", "/", "+", "*"][ray % 7];
                addGlyph(
                    Math.cos(angle) * radiusVariation,
                    Math.sin(angle) * radiusVariation,
                    x,
                    y,
                    tip,
                    ray % 11 === 0 ? 4 : 1,
                    phase,
                    1,
                    flowerIndex === 0 ? 0.95 : 0.72
                );
                seeds.push({
                    indices: Array.from({ length: kinds.length - first }, (_, i) => first + i),
                    x: Math.cos(angle) * radiusVariation,
                    y: Math.sin(angle) * radiusVariation,
                    ax: x,
                    ay: y,
                    phase,
                    body: createSeedBody(phase + ray * 0.73)
                });
            }
            for (let i = 0; i < 85; i++) {
                const angle = i * 2.39996;
                const radius = Math.sqrt(i / 85) * 0.072;
                addGlyph(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    x,
                    y,
                    [".", ":", "*"][i % 3],
                    2,
                    phase,
                    1,
                    0.22
                );
            }
            for (let step = 0; step < 30; step++) {
                const height = -step * 0.034;
                addGlyph(Math.sin(step * 0.07) * 0.017, height, x, y, "i", 0, phase, 2, 0.4);
            }
        });
        for (let i = 0; i < 30; i++) {
            addGlyph(
                0,
                0,
                Math.sin(i * 31.7) * 1.2,
                Math.cos(i * 17.4) * 0.7,
                i % 3 === 0 ? "+" : "*",
                i % 9 === 0 ? 4 : 1,
                i * 0.7,
                3,
                0.38
            );
        }
        const base = new THREE.PlaneGeometry(1, 1);
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.index = base.index;
        geometry.attributes.position = base.attributes.position;
        geometry.attributes.uv = base.attributes.uv;
        geometry.setAttribute("aAnchor", new THREE.InstancedBufferAttribute(new Float32Array(anchors), 2));
        geometry.setAttribute("aScale", new THREE.InstancedBufferAttribute(new Float32Array(scales), 1));
        geometry.setAttribute("aCenter", new THREE.InstancedBufferAttribute(new Float32Array(centers), 2));
        geometry.setAttribute("aGlyph", new THREE.InstancedBufferAttribute(new Float32Array(glyphIndices), 1));
        geometry.setAttribute("aColor", new THREE.InstancedBufferAttribute(new Float32Array(colors), 1));
        geometry.setAttribute("aSpeed", new THREE.InstancedBufferAttribute(new Float32Array(speeds), 1));
        geometry.setAttribute("aKind", new THREE.InstancedBufferAttribute(new Float32Array(kinds), 1));
        const motions = new THREE.InstancedBufferAttribute(new Float32Array(kinds.length * 4), 4);
        const poses = new THREE.InstancedBufferAttribute(new Float32Array(kinds.length * 3), 3);
        const pivots = new THREE.InstancedBufferAttribute(new Float32Array(kinds.length * 2), 2);
        motions.setUsage(THREE.DynamicDrawUsage);
        poses.setUsage(THREE.DynamicDrawUsage);
        for (let i = 0; i < kinds.length; i++) motions.setW(i, 1);
        for (const seed of seeds) {
            for (const index of seed.indices) pivots.setXY(index, seed.x * 0.84, seed.y * 0.84);
        }
        geometry.setAttribute("aMotion", motions);
        geometry.setAttribute("aPose", poses);
        geometry.setAttribute("aPivot", pivots);
        geometry.instanceCount = kinds.length;
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uAtlas: { value: atlas },
                uGlyphCount: { value: glyphs.length },
                uViewport: { value: new THREE.Vector2() },
                uTime: { value: 0 },
                uSize: { value: 30 }
            },
            transparent: true,
            depthTest: false,
            depthWrite: false
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        scene.add(mesh);
        let frame = 0;
        let elapsed = 0;
        let previous = 0;
        let visible = true;
        let lost = false;
        let disposed = false;
        let pointer: { x: number; y: number; time: number } | null = null;
        let airflow = { x: 0, y: 0 };
        let accumulator = 0;
        let viewportWidth = 0;
        let viewportHeight = 0;
        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const seedTip = (seed: (typeof seeds)[number]) => {
            const body = seed.body;
            const free = body.detachedAt !== null;
            const sway = free ? body.releaseSway : flowerSway(elapsed, seed.phase);
            const span = free ? 0.16 : 0.375;
            let x = (Math.cos(body.angle) * seed.x + Math.sin(body.angle) * seed.y) * span + seed.x * 0.625;
            let y = (-Math.sin(body.angle) * seed.x + Math.cos(body.angle) * seed.y) * span + seed.y * 0.625;
            if (free) {
                x += (Math.cos(body.releaseAngle) * seed.x + Math.sin(body.releaseAngle) * seed.y) * 0.215;
                y += (-Math.sin(body.releaseAngle) * seed.x + Math.cos(body.releaseAngle) * seed.y) * 0.215;
            }
            const worldX = Math.cos(sway) * x + Math.sin(sway) * y + body.x;
            const worldY = -Math.sin(sway) * x + Math.cos(sway) * y + body.y;
            return {
                x: ((seed.ax + 1) * viewportWidth + (worldX + sway) * viewportHeight) / 2,
                y: ((1 - seed.ay - worldY) * viewportHeight) / 2
            };
        };
        const updatePhysics = (dt: number) => {
            accumulator += dt;
            const step = 1 / 120;
            while (accumulator >= step) {
                const time = elapsed - accumulator + step;
                airflow.x *= Math.exp(-step * 8);
                airflow.y *= Math.exp(-step * 8);
                for (const seed of seeds) {
                    const tip = seedTip(seed);
                    const distance = pointer ? Math.hypot(tip.x - pointer.x, tip.y - pointer.y) : Infinity;
                    const influence = Math.exp(-(distance * distance) / (95 * 95));
                    const radius = Math.hypot(seed.x, seed.y);
                    const col = flow ? Math.max(0, Math.min(flow.columns - 1, Math.floor(tip.x / flow.cellWidth))) : 0;
                    const row = flow ? Math.max(0, Math.min(flow.rows - 1, Math.floor(tip.y / flow.cellHeight))) : 0;
                    const cell = flow ? row * flow.columns + col : 0;
                    const windX = flow ? (flow.vx[cell] * flow.cellWidth) / 200 : 0;
                    const windY = flow ? (-flow.vy[cell] * flow.cellHeight) / 200 : 0;
                    const torque =
                        ((seed.y * (airflow.x * influence + windX) - seed.x * (airflow.y * influence + windY)) /
                            radius) *
                        9;
                    stepSeed(seed.body, step, time, torque);
                }
                accumulator -= step;
            }
            for (const seed of seeds) {
                const body = seed.body;
                for (const index of seed.indices) {
                    motions.setXYZW(index, body.x, body.y, body.angle, body.opacity);
                    poses.setXYZ(index, body.detachedAt === null ? 0 : 1, body.releaseSway, body.releaseAngle);
                }
            }
            motions.needsUpdate = true;
            poses.needsUpdate = true;
        };
        const draw = () => {
            renderer.render(scene, camera);
            if (!flowContext) return;
            const ratio = Math.min(window.devicePixelRatio, 1.5);
            flowContext.setTransform(ratio, 0, 0, ratio, 0, 0);
            flowContext.clearRect(0, 0, viewportWidth, viewportHeight);
            if (!flow || elapsed > flowActiveUntil) return;
            flowContext.font = "11px ui-monospace, monospace";
            flowContext.textAlign = "center";
            flowContext.textBaseline = "middle";
            // The grid stays fixed; density defines the ribbon and velocity defines its characters.
            for (let row = 0; row < flow.rows; row++) {
                for (let col = 0; col < flow.columns; col++) {
                    const i = row * flow.columns + col;
                    const density = flow.density[i];
                    if (density < 0.035) continue;
                    const vx = flow.vx[i];
                    const vy = flow.vy[i];
                    const speed = Math.hypot(vx, vy);
                    let glyph = "-";
                    if (density > 0.17 && speed > 0.45) {
                        glyph = Math.abs(vx) > Math.abs(vy) * 0.85 ? (vx > 0 ? ">" : "<") : vy > 0 ? "v" : "^";
                    }
                    if (density > 0.46 && speed < 1.4) glyph = "o";
                    const alpha = Math.min(0.38, Math.pow((density - 0.035) / 0.965, 0.9) * 0.55);
                    flowContext.fillStyle = "rgba(169,201,184," + alpha + ")";
                    flowContext.fillText(glyph, (col + 0.5) * flow.cellWidth, (row + 0.5) * flow.cellHeight);
                }
            }
        };
        const resize = () => {
            const width = host.clientWidth;
            const height = host.clientHeight;
            if (!width || !height || lost || disposed) return;
            viewportWidth = width;
            viewportHeight = height;
            renderer.setSize(width, height);
            const ratio = Math.min(window.devicePixelRatio, 1.5);
            flowCanvas.width = Math.round(width * ratio);
            flowCanvas.height = Math.round(height * ratio);
            pointer = null;
            flow = new AsciiFlowField(width, height);
            flowActiveUntil = 0;
            flowAccumulator = 0;
            material.uniforms.uViewport.value.set(width, height);
            material.uniforms.uSize.value = width < 768 ? 22 : 32;
            draw();
        };
        const animate = (now: number) => {
            frame = 0;
            if (disposed || lost || !visible || document.hidden || motionQuery.matches) return;
            const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
            elapsed += dt;
            previous = now;
            if (flow && elapsed < flowActiveUntil) {
                flowAccumulator += dt;
                while (flowAccumulator >= 1 / 60) {
                    flow.step(1 / 60);
                    flowAccumulator -= 1 / 60;
                }
            } else flowAccumulator = 0;
            updatePhysics(dt);
            material.uniforms.uTime.value = elapsed;
            draw();
            frame = requestAnimationFrame(animate);
        };
        const sync = () => {
            cancelAnimationFrame(frame);
            previous = 0;
            pointer = null;
            flowAccumulator = 0;
            airflow = { x: 0, y: 0 };
            accumulator = 0;
            if (disposed || lost || !visible || document.hidden) return;
            if (motionQuery.matches) {
                pointer = null;
                flow = new AsciiFlowField(viewportWidth, viewportHeight);
                flowActiveUntil = 0;
                seeds.forEach((seed) => (seed.body = createSeedBody(seed.body.phase)));
                updatePhysics(0);
                draw();
            } else frame = requestAnimationFrame(animate);
        };
        const cut = (x: number, y: number, dx: number, dy: number, duration: number) => {
            const length = Math.hypot(dx, dy);
            const strength = Math.min(length / Math.max(duration, 16) / 2, 1);
            for (const seed of seeds) {
                if (seed.body.detachedAt !== null) continue;
                const tip = seedTip(seed);
                const t = Math.max(0, Math.min(1, ((tip.x - x) * dx + (tip.y - y) * dy) / (length * length)));
                if (Math.hypot(tip.x - x - dx * t, tip.y - y - dy * t) > 14 + strength * 8) continue;
                detachSeed(
                    seed.body,
                    elapsed,
                    flowerSway(elapsed, seed.phase),
                    (dx / length) * (0.12 + strength * 0.23),
                    (-dy / length) * (0.12 + strength * 0.23)
                );
            }
        };
        const stirFlow = (x: number, y: number, dx: number, dy: number, duration: number) => {
            if (!flow) return;
            flow.stir(x, y, dx, dy, duration);
            flowActiveUntil = elapsed + 8;
        };
        const onPointer = (event: PointerEvent) => {
            if (motionQuery.matches || !visible || document.hidden || lost || event.pointerType === "touch") return;
            const rect = host.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
                pointer = null;
                flowAccumulator = 0;
                return;
            }
            if (pointer) {
                const dx = x - pointer.x;
                const dy = y - pointer.y;
                const length = Math.hypot(dx, dy);
                const duration = event.timeStamp - pointer.time;
                if (length < 1) return;
                if (length < 240 && duration < 180) {
                    const speed = length / Math.max(duration, 1);
                    airflow = {
                        x: Math.max(-2, Math.min(2, dx / Math.max(duration, 8))),
                        y: Math.max(-2, Math.min(2, -dy / Math.max(duration, 8)))
                    };
                    if (speed > 0.65) {
                        cut(pointer.x, pointer.y, dx, dy, duration);
                    }
                    stirFlow(x, y, dx, dy, duration);
                } else {
                    flowAccumulator = 0;
                }
            }
            pointer = { x, y, time: event.timeStamp };
        };
        const onLeave = () => {
            pointer = null;
            flowAccumulator = 0;
        };
        const onClick = (event: PointerEvent) => {
            if (motionQuery.matches || !visible || document.hidden || lost) return;
            const rect = host.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
            cut(x - 65, y + 32, 130, -64, 40);
            stirFlow(x + 45, y - 22, 90, -44, 65);
        };
        const onLost = (event: Event) => {
            event.preventDefault();
            lost = true;
            renderer.domElement.style.opacity = "0";
            flowCanvas.style.opacity = "0";
            sync();
        };
        const onRestored = () => {
            lost = false;
            renderer.domElement.style.opacity = "1";
            flowCanvas.style.opacity = "1";
            resize();
            sync();
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        const intersectionObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            sync();
        });
        intersectionObserver.observe(host);
        // Listen through the hero's text overlay without intercepting links or scrolling.
        window.addEventListener("pointermove", onPointer, { passive: true });
        window.addEventListener("pointerdown", onClick, { passive: true });
        window.addEventListener("blur", onLeave);
        document.addEventListener("pointerleave", onLeave);
        document.addEventListener("visibilitychange", sync);
        motionQuery.addEventListener("change", sync);
        renderer.domElement.addEventListener("webglcontextlost", onLost);
        renderer.domElement.addEventListener("webglcontextrestored", onRestored);
        resize();
        sync();
        return () => {
            disposed = true;
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            window.removeEventListener("pointermove", onPointer);
            window.removeEventListener("pointerdown", onClick);
            window.removeEventListener("blur", onLeave);
            document.removeEventListener("pointerleave", onLeave);
            document.removeEventListener("visibilitychange", sync);
            motionQuery.removeEventListener("change", sync);
            renderer.domElement.removeEventListener("webglcontextlost", onLost);
            renderer.domElement.removeEventListener("webglcontextrestored", onRestored);
            geometry.dispose();
            base.dispose();
            material.dispose();
            atlas.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.domElement.remove();
            flowCanvas.remove();
        };
    }, [variant]);
    return (
        <div className={`${styles.background} ${variant === "login" ? styles.login : ""}`} aria-hidden="true">
            <div ref={hostRef} className={styles.canvas} />
            <div className={styles.shade} />
        </div>
    );
}
