"use client";

import { useEffect, useRef, useState } from "react";
import type { FocusEvent } from "react";

export function useCarousel(count: number) {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const pointerFocus = useRef(false);

    useEffect(() => {
        if (paused || hovered || focused) return;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const timer = window.setInterval(() => {
            if (!document.hidden && !reducedMotion.matches) {
                setActive((index) => (index + 1) % count);
            }
        }, 6000);
        return () => window.clearInterval(timer);
    }, [active, count, paused, hovered, focused]);

    return {
        active,
        select: setActive,
        paused,
        live: paused || hovered || focused ? ("polite" as const) : ("off" as const),
        togglePlayback: () => {
            if (paused) setFocused(false);
            setPaused((value) => !value);
        },
        focusHandlers: {
            onPointerDownCapture: () => {
                pointerFocus.current = true;
                setFocused(false);
            },
            onKeyDownCapture: () => {
                pointerFocus.current = false;
                setFocused(true);
            },
            onFocusCapture: () => {
                if (!pointerFocus.current) setFocused(true);
            },
            onBlurCapture: (event: FocusEvent<HTMLElement>) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    pointerFocus.current = false;
                    setFocused(false);
                }
            }
        },
        hoverHandlers: {
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => setHovered(false)
        }
    };
}
