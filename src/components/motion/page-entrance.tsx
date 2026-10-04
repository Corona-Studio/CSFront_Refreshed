"use client";

import { animate } from "motion/mini";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";

import { useMotionAllowed } from "./preferences";

export default function PageEntrance({ children }: { children: ReactNode }) {
    const path = usePathname();
    const ref = useRef<HTMLDivElement>(null);
    const allowed = useMotionAllowed();
    const previousPath = useRef(path);
    useEffect(() => {
        // The SSR first paint is already visible; animate only subsequent route changes.
        if (previousPath.current === path) return;
        previousPath.current = path;
        if (!allowed || !ref.current || typeof ref.current.animate !== "function") return;
        // Opacity only: preserve sticky/fixed descendants and the router's focus/scroll behavior.
        const animation = animate(ref.current, { opacity: [0.72, 1] }, { duration: 0.24, ease: "easeOut" });
        return () => animation.cancel();
    }, [allowed, path]);
    return <div ref={ref}>{children}</div>;
}
