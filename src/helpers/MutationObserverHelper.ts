import { RefObject, useEffect } from "react";

export const useMutationObserver = (
    ref: RefObject<Node>,
    callback: MutationCallback,
    options: MutationObserverInit
) => {
    useEffect(() => {
        if (ref.current) {
            const observer = new MutationObserver(callback);
            observer.observe(ref.current, options);
            return () => observer.disconnect();
        }
    }, [callback, options, ref]);
};
