"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";

import MotionProvider from "./provider";

import { useMotionAllowed } from "./preferences";

export default function PreviewSwap({ children, id }: { children: ReactNode; id: number }) {
    const allowed = useMotionAllowed();
    return (
        <MotionProvider>
            <m.div
                key={id}
                initial={false}
                animate={allowed ? { opacity: [0.6, 1], y: [6, 0] } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                {children}
            </m.div>
        </MotionProvider>
    );
}
