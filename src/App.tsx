import "./App.css";

import { createRef, CSSProperties, useEffect, useState } from "react";
import { Outlet } from "react-router";
import { BackTop } from "tdesign-react";

import MenuBar from "./components/MenuBar.tsx";
import { useThemeDetector } from "./helpers/ThemeDetector.ts";

function App() {
    const themeDetector = useThemeDetector();

    useEffect(() => {
        if (themeDetector) {
            document.documentElement.setAttribute("theme-mode", "dark");
            return;
        }

        document.documentElement.removeAttribute("theme-mode");
    }, [themeDetector]);

    return (
        <>
            <Outlet />
        </>
    );
}

export default App;
