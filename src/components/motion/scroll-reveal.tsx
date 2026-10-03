"use client";

import { scroll } from "motion";
import { animate } from "motion/mini";
import { Slot } from "radix-ui";
import { type ComponentProps, type Ref, useEffect, useRef } from "react";

import { useMotionAllowed } from "./preferences";

/** Progressively enhance the existing element without changing grid or semantic markup. */
export function ScrollReveal({
    asChild = false,
    index = 0,
    zoom = false,
    children,
    ...props
}: ComponentProps<"div"> & { asChild?: boolean; index?: number; zoom?: boolean }) {
    const ref = useRef<HTMLElement>(null);
    const allowed = useMotionAllowed();
    useEffect(() => {
        const element = ref.current;
        if (!allowed || !element || typeof element.animate !== "function") return;
        // Never hide the initial viewport, restored scroll positions or anchor destinations.
        if (element.getBoundingClientRect().top < window.innerHeight * 0.88) return;
        const distance = window.matchMedia("(max-width: 640px)").matches ? 18 : 32;
        const animation = animate(
            element,
            {
                opacity: [0.12, 1],
                transform: [`translateY(${distance}px) scale(${zoom ? 0.97 : 1})`, "translateY(0px) scale(1)"]
            },
            { duration: 1, ease: "linear", autoplay: false }
        );
        // Position, rather than a timer, determines progress. Native timelines when supported.
        const stagger = Math.min(Math.max(index, 0), 3) * 0.035;
        const stopScroll = scroll(animation, {
            target: element,
            offset: [`start ${0.96 - stagger}`, `start ${0.6 - stagger}`]
        });
        const revealFocusedContent = () => {
            stopScroll();
            animation.cancel();
        };
        element.addEventListener("focusin", revealFocusedContent);
        return () => {
            element.removeEventListener("focusin", revealFocusedContent);
            stopScroll();
            animation.cancel();
        };
    }, [allowed, index, zoom]);
    const Comp = asChild ? Slot.Root : "div";
    return (
        <Comp ref={ref as Ref<HTMLDivElement>} data-scroll-reveal="" {...props}>
            {children}
        </Comp>
    );
}
