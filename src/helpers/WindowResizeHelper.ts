import { useEffect, useState } from "react";

export const useWindowResize = () => {
    const getWindowBounds = () => {
        return [window.innerWidth, window.innerHeight];
    };

    const [bounds, setBounds] = useState(getWindowBounds());
    const resizeListener = () => {
        setBounds(getWindowBounds());
    };

    useEffect(() => {
        window.addEventListener("resize", resizeListener);

        return () => window.removeEventListener("resize", resizeListener);
    }, []);

    return bounds;
};
