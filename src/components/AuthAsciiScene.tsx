"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Euler, TorusKnotGeometry, Vector3 } from "three";

import AuthAsciiFluid from "./AuthAsciiFluid";
import styles from "./AuthAsciiScene.module.css";

type Face = { vertices: [Vector3, Vector3, Vector3]; normals: [Vector3, Vector3, Vector3] };

function knotSurface(): Face[] {
    const geometry = new TorusKnotGeometry(0.64, 0.21, 120, 16, 2, 3);
    const position = geometry.getAttribute("position");
    const normal = geometry.getAttribute("normal");
    const index = geometry.getIndex()!;
    const faces: Face[] = [];
    for (let i = 0; i < index.count; i += 3) {
        const indices = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
        faces.push({
            vertices: indices.map((j) => new Vector3().fromBufferAttribute(position, j)) as Face["vertices"],
            normals: indices.map((j) => new Vector3().fromBufferAttribute(normal, j)) as Face["normals"]
        });
    }
    geometry.dispose();
    return faces;
}

export default function AuthAsciiScene() {
    const register = usePathname().startsWith("/auth/register");
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (register) return;
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;
        const faces = knotSurface();
        const light = new Vector3(-0.4, 0.8, 1).normalize();
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let width = 0;
        let height = 0;
        let frame = 0;
        let elapsed = 0;
        let previous = 0;
        let lastDraw = 0;
        let visible = true;
        let targetX = 0;
        let targetY = 0;
        let tiltX = 0;
        let tiltY = 0;
        const draw = () => {
            const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            context.clearRect(0, 0, width, height);
            const fontSize = width < 480 ? 11 : 14;
            const cellWidth = fontSize * 0.66;
            const cellHeight = fontSize * 1.05;
            const cols = Math.ceil(width / cellWidth);
            const rows = Math.ceil(height / cellHeight);
            const depth = new Float32Array(cols * rows).fill(-Infinity);
            const faceAt = new Int8Array(cols * rows).fill(-1);
            const tones = new Float32Array(cols * rows);

            const size = Math.min(width * 0.42, height * 0.41);
            const cx = width * 0.5;
            const cy = height * 0.49;
            const rotation = new Euler(
                -0.48 + Math.sin(elapsed * 0.11) * 0.12 + tiltY,
                0.35 + Math.sin(elapsed * 0.16) * 0.38 + tiltX,
                -0.12
            );
            const projected = faces.map((face) => ({
                tones: face.normals.map(
                    (normal) => 0.16 + Math.max(0, normal.clone().applyEuler(rotation).dot(light)) * 0.84
                ),
                vertices: face.vertices.map((vertex) => {
                    const v = vertex.clone().applyEuler(rotation);
                    const perspective = 3.8 / (3.8 - v.z);
                    return { x: cx + v.x * size * perspective, y: cy - v.y * size * perspective, z: v.z };
                })
            }));
            // Rasterize solid 3D faces directly onto a fixed character grid with depth testing.
            for (const face of projected) {
                const [a, b, c] = face.vertices;
                const denominator = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
                if (Math.abs(denominator) < 0.01) continue;
                const minCol = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x) / cellWidth));
                const maxCol = Math.min(cols - 1, Math.ceil(Math.max(a.x, b.x, c.x) / cellWidth));
                const minRow = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y) / cellHeight));
                const maxRow = Math.min(rows - 1, Math.ceil(Math.max(a.y, b.y, c.y) / cellHeight));
                for (let row = minRow; row <= maxRow; row++) {
                    for (let col = minCol; col <= maxCol; col++) {
                        const x = (col + 0.5) * cellWidth;
                        const y = (row + 0.5) * cellHeight;
                        const u = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / denominator;
                        const v = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / denominator;
                        const w = 1 - u - v;
                        if (Math.min(u, v, w) < 0) continue;
                        const z = u * a.z + v * b.z + w * c.z;
                        const index = row * cols + col;
                        if (z < depth[index]) continue;
                        depth[index] = z;
                        faceAt[index] = 1;
                        tones[index] = u * face.tones[0] + v * face.tones[1] + w * face.tones[2];
                    }
                }
            }
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = `bold ${fontSize}px ui-monospace, monospace`;
            const glyphs = ".:+=*#";
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const i = row * cols + col;
                    let glyph: string;
                    if (faceAt[i] < 0) {
                        const nx = (col + 0.5) / cols;
                        const ny = (row + 0.5) / rows;
                        const wave = ny * 8 + Math.sin(nx * 5 + elapsed * 0.08) + Math.sin(nx * 10 - ny * 4) * 0.22;
                        const contour = Math.abs(wave - Math.round(wave));
                        const margin = Math.min(1, Math.min(nx, 1 - nx, ny, 1 - ny) * 8);
                        if (contour < 0.075) {
                            context.fillStyle = Math.round(wave) % 3 === 0 ? "#3d907a" : "#3456b8";
                            context.globalAlpha = (0.16 + (1 - contour / 0.075) * 0.15) * margin;
                            glyph = Math.cos(nx * 5 + elapsed * 0.08) > 0.3 ? "/" : "-";
                        } else {
                            if ((col * 7 + row * 11) % 29 > 1) continue;
                            context.fillStyle = "#456589";
                            context.globalAlpha = 0.23 * margin;
                            glyph = (col + row) % 4 === 0 ? "+" : ".";
                        }
                    } else {
                        const tone = tones[i];
                        const blue = depth[i] < -0.03;
                        const outline =
                            col > 0 &&
                            col < cols - 1 &&
                            row > 0 &&
                            row < rows - 1 &&
                            [i - 1, i + 1, i - cols, i + cols].some((neighbor) => faceAt[neighbor] < 0);
                        context.fillStyle = blue
                            ? "#3356d3"
                            : tone > 0.75
                              ? "#77de99"
                              : tone > 0.42
                                ? "#36b97d"
                                : "#136953";
                        context.globalAlpha = 0.6 + tone * 0.4;
                        glyph = outline && (col + row) % 3 === 0 ? "+" : glyphs[Math.min(5, Math.floor(tone * 5.9))];
                        if (!outline && (col * 3 + row) % 11 === 0) glyph = "/";
                    }
                    context.fillText(glyph, (col + 0.5) * cellWidth, (row + 0.5) * cellHeight);
                }
            }
            context.globalAlpha = 1;
            // Sparse registration marks give the scene a technical drawing rhythm.
            context.strokeStyle = "#33515b";
            context.lineWidth = 0.6;
            for (const x of [18, width - 18]) {
                for (const y of [24, height - 24]) {
                    context.beginPath();
                    context.moveTo(x - 6, y);
                    context.lineTo(x + 6, y);
                    context.moveTo(x, y - 6);
                    context.lineTo(x, y + 6);
                    context.stroke();
                }
            }
            context.font = "9px ui-monospace, monospace";
            context.fillStyle = "#6b8f96";
            context.textAlign = "left";
            context.fillText("TREFOIL / 02:03", 32, 24);
        };
        const animate = (now: number) => {
            frame = 0;
            if (!visible || document.hidden || motion.matches) return;
            const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
            elapsed += dt;
            previous = now;
            tiltX += (targetX - tiltX) * (1 - Math.exp(-dt * 4));
            tiltY += (targetY - tiltY) * (1 - Math.exp(-dt * 4));
            if (now - lastDraw >= 1000 / 30) {
                draw();
                lastDraw = now;
            }
            frame = requestAnimationFrame(animate);
        };
        const sync = () => {
            cancelAnimationFrame(frame);
            previous = lastDraw = 0;
            if (!visible || document.hidden) return;
            if (motion.matches) {
                elapsed = tiltX = tiltY = 0;
                draw();
            } else frame = requestAnimationFrame(animate);
        };
        const resize = () => {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            draw();
        };
        const onPointer = (event: PointerEvent) => {
            if (motion.matches || event.pointerType === "touch") return;
            const rect = canvas.getBoundingClientRect();
            targetX = ((event.clientX - rect.left) / width - 0.5) * 0.65;
            targetY = ((event.clientY - rect.top) / height - 0.5) * 0.35;
        };
        const onLeave = () => {
            targetX = targetY = 0;
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            sync();
        });
        observer.observe(canvas);
        canvas.addEventListener("pointermove", onPointer, { passive: true });
        canvas.addEventListener("pointerleave", onLeave);
        document.addEventListener("visibilitychange", sync);
        motion.addEventListener("change", sync);
        resize();
        sync();
        return () => {
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            observer.disconnect();
            canvas.removeEventListener("pointermove", onPointer);
            canvas.removeEventListener("pointerleave", onLeave);
            document.removeEventListener("visibilitychange", sync);
            motion.removeEventListener("change", sync);
        };
    }, [register]);

    return (
        <aside className={styles.scene}>
            <div className={styles.header}>
                <p className={styles.code}>{register ? "CS—003 / CREATE ACCOUNT" : "CS—002 / ACCOUNT ACCESS"}</p>
                <span className={styles.status}>{register ? "FLUID STUDY / B" : "FORM STUDY / A"}</span>
            </div>
            <div className={styles.drawing}>
                {register ? (
                    <AuthAsciiFluid />
                ) : (
                    <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
                )}
                {!register && <span className={styles.drawingNote}>01 / CONNECTED FORM</span>}
            </div>
            <div className={styles.copy}>
                <h2>
                    {register ? (
                        <>
                            MAKE
                            <br />
                            YOUR MARK<span>.</span>
                        </>
                    ) : (
                        <>
                            WELCOME
                            <br />
                            BACK<span>.</span>
                        </>
                    )}
                </h2>
                <p>{t(register ? "authScene.registerDescription" : "authScene.loginDescription")}</p>
            </div>
            <div className={styles.footer}>
                <span>CORONA STUDIO · PLAY / BUILD / CONNECT</span>
                {!register && <span>MOVE TO ROTATE / ASCII</span>}
            </div>
        </aside>
    );
}
