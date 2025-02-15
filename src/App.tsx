import "./App.css";

import { createRef, CSSProperties, useEffect, useState } from "react";
import { Outlet } from "react-router";
import { BackTop } from "tdesign-react";

import MenuBar from "./components/MenuBar.tsx";
import { useThemeDetector } from "./helpers/ThemeDetector.ts";

function App() {
    const containerRef = createRef<HTMLDivElement>();
    const themeDetector = useThemeDetector();

    const style: CSSProperties = {
        position: "absolute",
        insetInlineEnd: 24,
        insetBlockEnd: 80,
        zIndex: 10000
    };

    useEffect(() => {
        if (themeDetector) {
            document.documentElement.setAttribute("theme-mode", "dark");
            return;
        }

        document.documentElement.removeAttribute("theme-mode");
    }, [themeDetector]);

    return (
        <>
            <div className="w-full h-screen" ref={containerRef}>
                <MenuBar />
                <div style={{ position: "relative" }}>
                    <Outlet />
                </div>
            </div>

            <BackTop
                container={() => containerRef.current!}
                visibleHeight={46}
                style={style}></BackTop>
        </>
    );
}

export default App;
