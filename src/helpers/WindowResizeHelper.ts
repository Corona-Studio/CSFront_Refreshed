import { useSyncExternalStore } from "react";

interface WindowBounds {
    width: number;
    height: number;
}

let cachedBounds: WindowBounds | undefined;

function getSnapshot(): WindowBounds {
    if (!cachedBounds || cachedBounds.width !== window.innerWidth || cachedBounds.height !== window.innerHeight) {
        cachedBounds = { width: window.innerWidth, height: window.innerHeight };
    }
    return cachedBounds;
}

function subscribe(callback: () => void) {
    window.addEventListener("resize", callback, { passive: true });
    return () => window.removeEventListener("resize", callback);
}

export const useWindowResize = () => {
    const bounds = useSyncExternalStore(subscribe, getSnapshot, () => ({ width: 0, height: 0 }));
    return [bounds.width, bounds.height] as const;
};
