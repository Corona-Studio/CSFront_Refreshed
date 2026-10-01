"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import styles from "./KineticAsciiBackground.module.css";

const glyphs = " /\\>*.:[]{}<%&01+=#^i";
const vertexShader = `
    attribute vec2 aCenter;
    attribute vec2 aAnchor;
    attribute float aGlyph;
    attribute float aColor;
    attribute float aSpeed;
    attribute float aKind;
    attribute float aScale;
    uniform vec2 uViewport;
    uniform vec2 uPointer;
    uniform vec2 uPulseOrigin;
    uniform float uTime;
    uniform float uPulseStart;
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
        vec2 p = anchor + vec2(offset.x / aspect, offset.y);
        vec2 difference = (p - uPointer) * vec2(aspect, 1.0);
        float influence = exp(-dot(difference, difference) * 12.0);
        p += vec2(sin(uTime + aSpeed), cos(uTime * 0.7 + aSpeed)) * influence * 0.035;
        float age = uTime - uPulseStart;
        vec2 pulseDirection = (p - uPulseOrigin) * vec2(aspect, 1.0);
        float distance = length(pulseDirection);
        float pulse = exp(-pow((distance - age * 0.65) * 10.0, 2.0)) * max(0.0, 1.0 - age / 2.0);
        p += normalize(pulseDirection + vec2(0.001)) * pulse * 0.025;
        float scale = aScale * (1.0 + influence * 0.22 + pulse * 0.15);
        vec2 size = vec2(uSize, uSize) / uViewport * 2.0;
        gl_Position = vec4(p + position.xy * size * scale, 0.0, 1.0);
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
            : vColor < 1.5 ? vec3(0.01, 0.96, 0.03)
            : vColor < 2.5 ? vec3(0.0, 0.46, 0.27)
            : vColor < 3.5 ? vec3(1.0, 0.005, 0.045)
            : vec3(0.86, 0.88, 0.84);
        gl_FragColor = vec4(color, ink * vOpacity);
        #include <colorspace_fragment>
    }
`;

export default function KineticAsciiBackground() {
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
            { x: 0.42, y: 0.08, radius: 0.43, phase: 0.2 },
            { x: 0.92, y: 0.54, radius: 0.25, phase: 2.1 },
            { x: 0.96, y: -0.52, radius: 0.32, phase: 4.4 }
        ];
        flowers.forEach(({ x, y, radius, phase }, flowerIndex) => {
            for (let ray = 0; ray < 28; ray++) {
                const angle = (ray / 28) * Math.PI * 2;
                const radiusVariation = radius * (0.94 + Math.sin(ray * 2.7) * 0.055);
                for (let step = 3; step <= 15; step++) {
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
        geometry.instanceCount = kinds.length;
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uAtlas: { value: atlas },
                uGlyphCount: { value: glyphs.length },
                uViewport: { value: new THREE.Vector2() },
                uPointer: { value: new THREE.Vector2(-10, -10) },
                uPulseOrigin: { value: new THREE.Vector2() },
                uTime: { value: 0 },
                uPulseStart: { value: -1000 },
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
        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const draw = () => renderer.render(scene, camera);
        const resize = () => {
            const width = host.clientWidth;
            const height = host.clientHeight;
            if (!width || !height || lost || disposed) return;
            renderer.setSize(width, height);
            material.uniforms.uViewport.value.set(width, height);
            material.uniforms.uSize.value = width < 768 ? 22 : 32;
            draw();
        };
        const animate = (now: number) => {
            frame = 0;
            if (disposed || lost || !visible || document.hidden || motionQuery.matches) return;
            elapsed += previous ? Math.min((now - previous) / 1000, 0.05) : 0;
            previous = now;
            material.uniforms.uTime.value = elapsed;
            draw();
            frame = requestAnimationFrame(animate);
        };
        const sync = () => {
            cancelAnimationFrame(frame);
            previous = 0;
            if (disposed || lost || !visible || document.hidden) return;
            if (motionQuery.matches) {
                material.uniforms.uPointer.value.set(-10, -10);
                draw();
            } else frame = requestAnimationFrame(animate);
        };
        const onPointer = (event: PointerEvent) => {
            if (motionQuery.matches) return;
            const rect = host.getBoundingClientRect();
            material.uniforms.uPointer.value.set(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                1 - ((event.clientY - rect.top) / rect.height) * 2
            );
        };
        const onLeave = () => material.uniforms.uPointer.value.set(-10, -10);
        const onClick = (event: PointerEvent) => {
            if (motionQuery.matches) return;
            onPointer(event);
            material.uniforms.uPulseOrigin.value.copy(material.uniforms.uPointer.value);
            material.uniforms.uPulseStart.value = elapsed;
        };
        const onLost = (event: Event) => {
            event.preventDefault();
            lost = true;
            renderer.domElement.style.opacity = "0";
            sync();
        };
        const onRestored = () => {
            lost = false;
            renderer.domElement.style.opacity = "1";
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
        host.addEventListener("pointermove", onPointer);
        host.addEventListener("pointerdown", onClick);
        host.addEventListener("pointerleave", onLeave);
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
            host.removeEventListener("pointermove", onPointer);
            host.removeEventListener("pointerdown", onClick);
            host.removeEventListener("pointerleave", onLeave);
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
        };
    }, []);
    return (
        <div className={styles.background} aria-hidden="true">
            <div ref={hostRef} className={styles.canvas} />
            <div className={styles.shade} />
            <div className={styles.caption}>
                <span>CS—001 / CREATIVE SYSTEMS</span>
                <span>MOVE TO DISTORT · CLICK TO RIPPLE</span>
            </div>
        </div>
    );
}
