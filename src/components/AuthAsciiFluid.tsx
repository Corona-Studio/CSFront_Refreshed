"use client";

import { useEffect, useRef } from "react";

import styles from "./AuthAsciiScene.module.css";
import { AsciiFluidSimulation } from "./asciiFluidSimulation";
import { observeAuthAsciiTheme, readAuthAsciiPalette } from "./authAsciiPalette";

export default function AuthAsciiFluid() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;
        let palette = readAuthAsciiPalette();
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let simulation: AsciiFluidSimulation;
        let width = 0;
        let height = 0;
        let frame = 0;
        let previous = 0;
        let accumulator = 0;
        let lastDraw = 0;
        let visible = true;
        let pointer: { x: number; y: number; time: number; id: number } | null = null;
        const draw = () => {
            if (!simulation) return;
            const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
            context.clearRect(0, 0, width, height);
            const flow = simulation.flow;
            context.font = `bold ${width < 480 ? 11 : 13}px ui-monospace, monospace`;
            context.textAlign = "center";
            context.textBaseline = "middle";
            for (let row = 0; row < flow.rows; row++) {
                for (let col = 0; col < flow.columns; col++) {
                    const i = row * flow.columns + col;
                    const density = flow.density[i];
                    const foam = simulation.foam[i];
                    const vx = flow.vx[i];
                    const vy = flow.vy[i];
                    const speed = Math.hypot(vx, vy);
                    const x = (col + 0.5) * flow.cellWidth;
                    const y = (row + 0.5) * flow.cellHeight;
                    const edge = Math.min(1, Math.min(x, width - x, y, height - y) / 42);
                    if (density < 0.03 || edge <= 0) continue;
                    const glow = Math.min(1, density * 1.5 + foam * 0.4 + speed * 0.025);
                    context.fillStyle = palette.ramp[Math.round(Math.max(0, Math.min(1, glow)) * 63)];
                    context.globalAlpha = Math.min(0.88, 0.18 + density * 1.4 + foam * 0.25) * edge;
                    let glyph = density < 0.08 ? "." : density < 0.17 ? ":" : "~";
                    if (speed > 0.6 && density > 0.13) {
                        const angle = Math.atan2(vy, vx);
                        glyph =
                            Math.abs(vx) > Math.abs(vy) * 1.6
                                ? "-"
                                : Math.abs(vy) > Math.abs(vx) * 1.6
                                  ? "|"
                                  : angle * vx > 0
                                    ? "\\"
                                    : "/";
                        if (density > 0.3 && (col + row) % 4 === 0)
                            glyph = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? ">" : "<") : vy > 0 ? "v" : "^";
                    }
                    if (foam > 0.18 && (col + row) % 3 === 0) glyph = ["*", "+", ":"][(col * 3 + row) % 3];
                    context.fillText(glyph, x, y);
                }
            }
            context.globalAlpha = 1;
        };
        const animate = (now: number) => {
            frame = 0;
            if (!visible || document.hidden || motion.matches) return;
            accumulator += previous ? Math.min((now - previous) / 1000, 0.05) : 0;
            previous = now;
            while (accumulator >= 1 / 60) {
                simulation.step(1 / 60);
                accumulator -= 1 / 60;
            }
            if (now - lastDraw >= 1000 / 30) {
                draw();
                lastDraw = now;
            }
            frame = requestAnimationFrame(animate);
        };
        const sync = () => {
            cancelAnimationFrame(frame);
            previous = lastDraw = 0;
            accumulator = 0;
            pointer = null;
            if (!visible || document.hidden || !simulation) return;
            if (motion.matches) draw();
            else frame = requestAnimationFrame(animate);
        };
        const resize = () => {
            const nextWidth = canvas.clientWidth;
            const nextHeight = canvas.clientHeight;
            if (!nextWidth || !nextHeight || (nextWidth === width && nextHeight === height)) return;
            width = nextWidth;
            height = nextHeight;
            const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            simulation = new AsciiFluidSimulation(width, height, width < 480 ? 8 : 9, width < 480 ? 12 : 14);
            pointer = null;
            accumulator = 0;
            draw();
        };
        const position = (event: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                time: event.timeStamp,
                id: event.pointerId
            };
        };
        const onDown = (event: PointerEvent) => {
            if (
                motion.matches ||
                !simulation ||
                !visible ||
                document.hidden ||
                (pointer && pointer.id !== event.pointerId && canvas.hasPointerCapture(pointer.id))
            )
                return;
            pointer = position(event);
            canvas.setPointerCapture(event.pointerId);
            simulation.stir(pointer.x, pointer.y, 0, 0, 16);
        };
        const onMove = (event: PointerEvent) => {
            if (
                motion.matches ||
                !simulation ||
                !visible ||
                document.hidden ||
                (pointer && pointer.id !== event.pointerId)
            )
                return;
            const next = position(event);
            if (pointer) {
                const dx = next.x - pointer.x;
                const dy = next.y - pointer.y;
                const duration = next.time - pointer.time;
                if (duration < 200 && Math.hypot(dx, dy) < width * 0.6)
                    simulation.stir(next.x, next.y, dx, dy, duration);
            }
            pointer = next;
        };
        const onUp = (event: PointerEvent) => {
            if (pointer && pointer.id !== event.pointerId) return;
            if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
            pointer = null;
        };
        const onLeave = () => {
            pointer = null;
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            sync();
        });
        observer.observe(canvas);
        canvas.addEventListener("pointerdown", onDown);
        canvas.addEventListener("pointermove", onMove, { passive: true });
        canvas.addEventListener("pointerup", onUp);
        canvas.addEventListener("pointercancel", onUp);
        canvas.addEventListener("lostpointercapture", onUp);
        canvas.addEventListener("pointerleave", onLeave);
        document.addEventListener("visibilitychange", sync);
        motion.addEventListener("change", sync);
        const stopThemeObserver = observeAuthAsciiTheme(() => {
            palette = readAuthAsciiPalette();
            draw();
        });
        resize();
        sync();
        return () => {
            cancelAnimationFrame(frame);
            stopThemeObserver();
            resizeObserver.disconnect();
            observer.disconnect();
            canvas.removeEventListener("pointerdown", onDown);
            canvas.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("pointerup", onUp);
            canvas.removeEventListener("pointercancel", onUp);
            canvas.removeEventListener("lostpointercapture", onUp);
            canvas.removeEventListener("pointerleave", onLeave);
            document.removeEventListener("visibilitychange", sync);
            motion.removeEventListener("change", sync);
        };
    }, []);
    return <canvas ref={canvasRef} className={`${styles.canvas} ${styles.fluidCanvas}`} aria-hidden="true" />;
}
