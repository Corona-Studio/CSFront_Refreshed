"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import styles from "./GraphicPlaneBackground.module.css";

const GraphicPlaneBackground = dynamic(() => import("./GraphicPlaneBackground"), { ssr: false });

/** Paint the decorative shell with SSR; download WebGL only after critical resources and hydration. */
export default function DeferredGraphicBackground() {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        let idle: number | undefined;
        let timer: number | undefined;
        const schedule = () => {
            if (typeof window.requestIdleCallback === "function") {
                idle = window.requestIdleCallback(() => setReady(true), { timeout: 1000 });
            } else {
                timer = window.setTimeout(() => setReady(true), 0);
            }
        };
        if (document.readyState === "complete") schedule();
        else window.addEventListener("load", schedule, { once: true });
        return () => {
            window.removeEventListener("load", schedule);
            if (idle !== undefined) window.cancelIdleCallback(idle);
            if (timer !== undefined) window.clearTimeout(timer);
        };
    }, []);
    if (ready) return <GraphicPlaneBackground />;
    return (
        <div className={styles.background} aria-hidden="true">
            <div className={styles.canvas} />
            <div className={styles.shade} />
            <span className={styles.caption}>
                CS / FIELD STUDY — 001
                <br />
                PLAY. BUILD. CONNECT.
            </span>
        </div>
    );
}
