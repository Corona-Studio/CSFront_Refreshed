"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
function subscribe(onChange: () => void) {
    const preference = window.matchMedia?.(query);
    preference?.addEventListener("change", onChange);
    return () => preference?.removeEventListener("change", onChange);
}
function getSnapshot() {
    return typeof window.matchMedia === "function" && !window.matchMedia(query).matches;
}

// Static on the server and before hydration; also responds to preference changes at runtime.
export function useMotionAllowed() {
    return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
