import { useEffect } from "react";
import { Outlet } from "react-router";

import "./App.css";
import Footer from "./components/Footer.tsx";
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
            <MenuBar />
            <Outlet />
            <Footer />
        </>
    );
}

export default App;
