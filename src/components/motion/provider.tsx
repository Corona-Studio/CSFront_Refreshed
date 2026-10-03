"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

const loadFeatures = () => import("./features").then((module) => module.default);

export default function MotionProvider({ children }: { children: ReactNode }) {
    return (
        <MotionConfig reducedMotion="user" transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
            <LazyMotion features={loadFeatures}>{children}</LazyMotion>
        </MotionConfig>
    );
}
