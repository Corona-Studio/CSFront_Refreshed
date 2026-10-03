"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import styles from "./GraphicPlaneBackground.module.css";

// The atlas encodes substrate, signal, panel and theme-primary inks independently.
// These are continuous technical plates, with no card borders or rounded geometry.
function createAtlas() {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;
    for (let tile = 0; tile < 8; tile++) {
        ctx.save();
        ctx.translate((tile % 4) * 512, Math.floor(tile / 4) * 512);
        const blue = "#0000ff",
            green = "#ff0000",
            cyan = "#ffffff";
        ctx.fillStyle = tile === 0 || tile === 2 || tile === 5 ? blue : tile === 4 ? green : cyan;
        ctx.fillRect(0, 0, 512, 512);
        ctx.globalAlpha = 0.18;
        ctx.strokeStyle = tile === 4 ? "#920069" : "#a7adc9";
        ctx.lineWidth = 0.8;
        for (let n = 0; n <= 512; n += 32) {
            ctx.beginPath();
            ctx.moveTo(n, 0);
            ctx.lineTo(n, 512);
            ctx.moveTo(0, n);
            ctx.lineTo(512, n);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        if (tile === 0) {
            ctx.fillStyle = green;
            for (let y = 12; y < 512; y += 19) {
                for (let x = 12; x < 512; x += 19) {
                    ctx.beginPath();
                    ctx.arc(x, y, (x + y) % 3 === 0 ? 2.8 : 1.3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.fillRect(0, 60, 512, 3);
            ctx.fillRect(0, 400, 512, 3);
        } else if (tile === 2 || tile === 5) {
            ctx.fillStyle = green;
            ctx.font = "bold 114px Arial, sans-serif";
            ctx.fillText(tile === 2 ? "CORONA" : "STUDIO", 8, 228);
            ctx.font = "22px monospace";
            ctx.fillText("PLAY / BUILD / CONNECT", 12, 263);
            ctx.font = "13px monospace";
            for (let row = 0; row < 12; row++) {
                ctx.fillText(
                    `${row % 3 === 0 ? "CS  02  16" : "LX  41  28"}   7  9  4  3   SYSTEM  /  CONNECT`,
                    12,
                    292 + row * 17
                );
            }
            ctx.strokeStyle = green;
            ctx.lineWidth = 2.5;
            ctx.font = "bold 155px Arial, sans-serif";
            ctx.strokeText(tile === 2 ? "CS" : "01", 12, 142);
            ctx.font = "36px monospace";
            ctx.strokeText("2016.1/156", 20, 192);
        } else if (tile === 4) {
            ctx.fillStyle = blue;
            ctx.font = "bold 88px Arial, sans-serif";
            ctx.fillText("41.2", 16, 162);
            ctx.fillRect(0, 186, 512, 5);
            ctx.fillRect(0, 438, 512, 4);
            for (let i = 0; i < 64; i++) {
                ctx.fillRect(200 + i * 4, 0, i % 4 === 0 ? 2 : 1, 512);
            }
            ctx.font = "14px monospace";
            ctx.fillText("S  2  5  8  /  369", 16, 475);
        } else if (tile === 7) {
            ctx.strokeStyle = green;
            ctx.lineWidth = 5;
            // Four hard-edged lobes, as in the registration symbol of the reference.
            const points = [
                [-30, -110],
                [30, -110],
                [50, -90],
                [50, -50],
                [90, -50],
                [110, -30],
                [110, 30],
                [90, 50],
                [50, 50],
                [50, 90],
                [30, 110],
                [-30, 110],
                [-50, 90],
                [-50, 50],
                [-90, 50],
                [-110, 30],
                [-110, -30],
                [-90, -50],
                [-50, -50],
                [-50, -90],
                [-30, -110]
            ];
            for (let scale = 1; scale <= 1.7; scale += 0.22) {
                ctx.beginPath();
                points.forEach(([x, y], i) => {
                    if (i === 0) ctx.moveTo(256 + x * scale, 256 + y * scale);
                    else ctx.lineTo(256 + x * scale, 256 + y * scale);
                });
                ctx.stroke();
            }
            ctx.fillStyle = green;
            ctx.fillRect(245, 216, 22, 80);
            ctx.fillRect(216, 245, 80, 22);
        } else {
            // A patchwork of rectangular signal planes, fine rules and tiny binary legends.
            for (let y = 0; y < 512; y += 64) {
                for (let x = 0; x < 512; x += 64) {
                    const code = (x * 7 + y * 11 + tile * 31) % 17;
                    ctx.fillStyle = code < 3 ? blue : code < 5 ? green : code < 12 ? "#cbd4ed" : cyan;
                    ctx.fillRect(x, y, code % 2 ? 128 : 64, 64);
                }
            }
            ctx.fillStyle = blue;
            ctx.fillRect(0, 350, 512, 6);
            ctx.fillRect(0, 370, 512, 2);
            ctx.font = "10px monospace";
            for (let i = 0; i < 8; i++) ctx.fillText("01  SYSTEM  28  07  16  001  010  101", 16, 400 + i * 12);
        }
        // Sparse yellow-coded accents take their displayed color from the site's --primary.
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(12, 18, tile % 2 === 0 ? 148 : 76, 5);
        ctx.fillRect(12, 28, 34, 3);
        for (let n = 0; n < 5; n++) ctx.fillRect(466, 30 + n * 15, n % 2 === 0 ? 16 : 7, 5);
        if (tile === 3 || tile === 6) {
            ctx.fillRect(320, 192, 64, 64);
            ctx.fillRect(256, 256, 64, 32);
        }
        if (tile === 4) ctx.fillRect(168, 0, 20, 512);
        ctx.restore();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
}

const vertexShader = `
    attribute vec3 aCenter;
    attribute vec4 aRect;
    attribute vec2 aSize;
    attribute float aLayer;
    uniform float uTime;
    varying vec2 vUv;
    varying float vLayer;
    void main() {
        vUv = aRect.xy + uv * aRect.zw;
        vLayer = aLayer;
        vec3 p = position;
        p.xy *= aSize;
        // All rigid panels travel at the same speed; wrap happens well outside the frustum.
        vec3 center = aCenter;
        center.x = mod(center.x + 40.0 - uTime * 0.24, 80.0) - 40.0;
        p += center;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
`;
const fragmentShader = `
    uniform sampler2D uAtlas;
    uniform float uDark;
    uniform vec3 uPrimary;
    varying vec2 vUv;
    varying float vLayer;
    void main() {
        vec3 ink = texture2D(uAtlas, vUv).rgb;
        float paper = min(min(ink.r, ink.g), ink.b);
        float signal = max(ink.r - ink.g, 0.0);
        float panel = max(ink.b - ink.g, 0.0);
        float primary = max(min(ink.r, ink.g) - ink.b, 0.0);
        // Both modes share porcelain, warm graphite and theme yellow, with inverted surface lightness.
        vec3 base = mix(vec3(0.88, 0.85, 0.79), vec3(0.023, 0.022, 0.020), uDark);
        vec3 accent = mix(vec3(0.45, 0.46, 0.43), vec3(0.26, 0.25, 0.22), uDark);
        vec3 secondary = mix(vec3(0.11, 0.13, 0.14), vec3(0.007, 0.007, 0.006), uDark);
        vec3 color = vec3(0.005) + base * paper + accent * signal + secondary * panel + uPrimary * primary;
        color *= 1.0 - max(vLayer, 0.0) * 0.018;
        float colored = max(primary, max(signal, panel));
        float opacity = vLayer < 0.0 ? 1.0 : vLayer < 0.5
            ? mix(0.78, 0.96, colored)
            : mix(0.11, 0.34, colored) * (1.0 - vLayer * 0.07);
        gl_FragColor = vec4(color, opacity);
        #include <colorspace_fragment>
    }
`;

export default function GraphicPlaneBackground() {
    const hostRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        } catch {
            return; // The CSS composition remains visible without WebGL.
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        camera.position.set(0, 0, 21);
        const atlas = createAtlas();
        atlas.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        const centers: number[] = [],
            rects: number[] = [],
            sizes: number[] = [],
            layers: number[] = [];
        let seed = 2016;
        const random = () => {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            return seed / 4294967296;
        };
        const panels: { x: number; y: number; w: number; h: number; tile: number }[] = [];
        for (let row = -3; row <= 3; row++) {
            for (let col = 0; col < 13; col++) {
                if (random() < 0.1) continue;
                const isBand = random() < 0.24;
                panels.push({
                    x: -40 + ((col + 0.5) * 80) / 13 + (random() - 0.5) * 1.5,
                    y: row * 5.4 + (random() - 0.5) * 1.8,
                    w: isBand ? 9 + random() * 7 : 6.2 + random() * 3.5,
                    h: isBand ? 1.0 + random() * 1.4 : 5.5 + random() * 3.3,
                    tile: Math.floor(random() * 8)
                });
            }
        }
        for (let layer = 7; layer >= 0; layer--) {
            panels.forEach(({ x, y, w, h, tile }, index) => {
                const strips = Math.round(h * 5);
                for (let strip = 0; strip < strips; strip++) {
                    const offset = ((Math.floor(strip / 5) % 3) - 1) * (index % 4 === 0 ? 0.18 : 0);
                    centers.push(
                        x + layer * 0.16 + offset,
                        y + (strip / strips - 0.5) * h + layer * 0.065,
                        -layer * 0.38 + (index % 3) * 0.35
                    );
                    rects.push((tile % 4) / 4, Math.floor(tile / 4) / 2 + strip / strips / 2, 1 / 4, 1 / strips / 2);
                    sizes.push(w, (h / strips) * (index % 3 === 0 ? 0.98 : 0.84));
                    layers.push(layer);
                }
            });
        }
        const base = new THREE.PlaneGeometry(1, 1);
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.index = base.index;
        geometry.attributes.position = base.attributes.position;
        geometry.attributes.uv = base.attributes.uv;
        geometry.setAttribute("aCenter", new THREE.InstancedBufferAttribute(new Float32Array(centers), 3));
        geometry.setAttribute("aRect", new THREE.InstancedBufferAttribute(new Float32Array(rects), 4));
        geometry.setAttribute("aSize", new THREE.InstancedBufferAttribute(new Float32Array(sizes), 2));
        geometry.setAttribute("aLayer", new THREE.InstancedBufferAttribute(new Float32Array(layers), 1));
        geometry.instanceCount = layers.length;
        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            uniforms: {
                uAtlas: { value: atlas },
                uTime: { value: 0 },
                uDark: { value: 0 },
                uPrimary: { value: new THREE.Color("#ffb21a") }
            }
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        mesh.renderOrder = 1;
        const field = new THREE.Group();
        field.add(mesh);
        // A separate registration grid remains visible through all eight relief layers.
        const gridCanvas = document.createElement("canvas");
        gridCanvas.width = gridCanvas.height = 256;
        const gridCtx = gridCanvas.getContext("2d")!;
        gridCtx.fillStyle = "#e6e6e6";
        gridCtx.fillRect(0, 0, 256, 256);
        gridCtx.strokeStyle = "#cecece";
        gridCtx.lineWidth = 0.6;
        for (let n = 0; n <= 256; n += 64) {
            gridCtx.beginPath();
            gridCtx.moveTo(n, 0);
            gridCtx.lineTo(n, 256);
            gridCtx.moveTo(0, n);
            gridCtx.lineTo(256, n);
            gridCtx.stroke();
        }
        gridCtx.strokeStyle = "#242424";
        gridCtx.lineWidth = 2.7;
        gridCtx.beginPath();
        gridCtx.moveTo(110, 128);
        gridCtx.lineTo(146, 128);
        gridCtx.moveTo(128, 110);
        gridCtx.lineTo(128, 146);
        gridCtx.stroke();
        gridCtx.fillStyle = "#383838";
        gridCtx.fillRect(62, 62, 3, 3);
        gridCtx.font = "10px monospace";
        gridCtx.fillText("2  /  5  /  8", 170, 220);
        const gridTexture = new THREE.CanvasTexture(gridCanvas);
        gridTexture.wrapS = gridTexture.wrapT = THREE.RepeatWrapping;
        gridTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        const gridGeometry = new THREE.PlaneGeometry(70, 50);
        const gridMaterial = new THREE.ShaderMaterial({
            vertexShader: `varying vec2 vUv; varying float vLayer; uniform float uTime;
                void main() { vUv = uv * vec2(35.0, 25.0) + vec2(uTime * 0.12, 0.0); vLayer = -1.0;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader,
            uniforms: {
                uAtlas: { value: gridTexture },
                uDark: material.uniforms.uDark,
                uPrimary: material.uniforms.uPrimary,
                uTime: material.uniforms.uTime
            }
        });
        const grid = new THREE.Mesh(gridGeometry, gridMaterial);
        grid.position.z = -3.6;
        field.add(grid);
        const markersMaterial = new THREE.ShaderMaterial({
            vertexShader: gridMaterial.vertexShader,
            fragmentShader: `uniform sampler2D uAtlas; varying vec2 vUv;
                void main() {
                    float ink = texture2D(uAtlas, vUv).r;
                    float mark = 1.0 - smoothstep(0.12, 0.27, ink);
                    if (mark < 0.02) discard;
                    gl_FragColor = vec4(vec3(0.004, 0.01, 0.014), mark * 0.9);
                    #include <colorspace_fragment>
                }`,
            uniforms: { uAtlas: { value: gridTexture }, uTime: material.uniforms.uTime },
            transparent: true,
            depthWrite: false,
            depthTest: false
        });
        const markers = new THREE.Mesh(gridGeometry, markersMaterial);
        markers.position.z = 1.4;
        markers.renderOrder = 2;
        field.add(markers);
        scene.add(field);
        // Render the relief first, then blur only this background in a separate GPU pass.
        // This avoids backdrop-filter sampling the header or creating a rectangular seam.
        const target = new THREE.WebGLRenderTarget(1, 1);
        const postScene = new THREE.Scene();
        const postCamera = new THREE.Camera();
        const postGeometry = new THREE.PlaneGeometry(2, 2);
        const postMaterial = new THREE.ShaderMaterial({
            depthTest: false,
            depthWrite: false,
            uniforms: { uScene: { value: target.texture }, uResolution: { value: new THREE.Vector2(1, 1) } },
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
            fragmentShader: `
                uniform sampler2D uScene;
                uniform vec2 uResolution;
                varying vec2 vUv;
                void main() {
                    float copyBlur = (1.0 - smoothstep(0.12, 0.65, vUv.x)) * 13.0;
                    float edgeBlur = (1.0 - smoothstep(0.0, 0.17, vUv.y)) * 9.0;
                    float distanceBlur = smoothstep(0.65, 1.0, vUv.y) * 2.5;
                    vec2 radius = vec2(max(copyBlur, max(edgeBlur, distanceBlur))) / uResolution;
                    vec4 color = texture2D(uScene, vUv) * 0.16;
                    for (int i = 0; i < 16; i++) {
                        float angle = float(i) * 2.399963;
                        vec2 offset = vec2(cos(angle), sin(angle)) * sqrt((float(i) + 0.5) / 16.0);
                        color += texture2D(uScene, clamp(vUv + offset * radius * 2.0, 0.001, 0.999)) * 0.0525;
                    }
                    gl_FragColor = color;
                    #include <colorspace_fragment>
                }
            `
        });
        postScene.add(new THREE.Mesh(postGeometry, postMaterial));
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let frame = 0,
            elapsed = 0,
            previous = 0,
            lastDraw = 0;
        let visible = true,
            lost = false,
            disposed = false;
        const updateTheme = () => {
            material.uniforms.uDark.value = document.documentElement.getAttribute("theme-mode") === "dark" ? 1 : 0;
            const primary = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
            material.uniforms.uPrimary.value.set(primary || "#ffb21a");
        };
        updateTheme();
        const draw = () => {
            material.uniforms.uTime.value = elapsed;
            field.rotation.set(-0.62, 0.12, -0.4);
            field.position.set(3, 0, 0);
            renderer.setRenderTarget(target);
            renderer.render(scene, camera);
            renderer.setRenderTarget(null);
            renderer.render(postScene, postCamera);
        };
        const animate = (now: number) => {
            frame = 0;
            if (disposed || lost || !visible || document.hidden || motion.matches) return;
            const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
            previous = now;
            elapsed += dt;
            if (now - lastDraw > 1000 / 30) {
                draw();
                lastDraw = now;
            }
            frame = requestAnimationFrame(animate);
        };
        const sync = () => {
            cancelAnimationFrame(frame);
            previous = lastDraw = 0;
            if (disposed || lost || !visible || document.hidden) return;
            if (motion.matches) {
                elapsed = 0;
                draw();
            } else frame = requestAnimationFrame(animate);
        };
        const resize = () => {
            if (disposed || lost) return;
            const { width, height } = host.getBoundingClientRect();
            if (!width || !height) return;
            renderer.setSize(width, height);
            renderer.getDrawingBufferSize(postMaterial.uniforms.uResolution.value);
            const resolution = postMaterial.uniforms.uResolution.value;
            target.setSize(resolution.x, resolution.y);
            camera.aspect = width / height;
            camera.position.z = camera.aspect < 1 ? 24 : 21;
            camera.updateProjectionMatrix();
            draw();
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
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            sync();
        });
        observer.observe(host);
        const themeObserver = new MutationObserver(() => {
            updateTheme();
            if (!disposed && !lost) draw();
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["theme-mode"] });
        document.addEventListener("visibilitychange", sync);
        motion.addEventListener("change", sync);
        renderer.domElement.addEventListener("webglcontextlost", onLost);
        renderer.domElement.addEventListener("webglcontextrestored", onRestored);
        resize();
        sync();
        return () => {
            disposed = true;
            cancelAnimationFrame(frame);
            observer.disconnect();
            resizeObserver.disconnect();
            themeObserver.disconnect();
            document.removeEventListener("visibilitychange", sync);
            motion.removeEventListener("change", sync);
            renderer.domElement.removeEventListener("webglcontextlost", onLost);
            renderer.domElement.removeEventListener("webglcontextrestored", onRestored);
            geometry.dispose();
            base.dispose();
            material.dispose();
            atlas.dispose();
            gridTexture.dispose();
            gridGeometry.dispose();
            gridMaterial.dispose();
            markersMaterial.dispose();
            target.dispose();
            postGeometry.dispose();
            postMaterial.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.domElement.remove();
        };
    }, []);
    return (
        <div className={styles.background} aria-hidden="true">
            <div ref={hostRef} className={styles.canvas} />
            <div className={styles.shade} />
            <span className={styles.caption}>
                CS / FIELD STUDY — 001
                <br />
                PLAY. BUILD. CONNECT.
            </span>
        </div>
    );
}
