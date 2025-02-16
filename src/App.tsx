import { useEffect } from "react";
import { Outlet, useMatches } from "react-router";

import "./App.css";
import Footer from "./components/Footer.tsx";
import MenuBar from "./components/MenuBar.tsx";
import { useThemeDetector } from "./helpers/ThemeDetector.ts";
import IMatches from "./interfaces/IMatches.ts";

interface HandleType {
    title: (param?: string) => string;
}

function App() {
    const themeDetector = useThemeDetector();
    const matches = useMatches() as IMatches[];
    const { handle, data } = matches[matches.length - 1];

    console.log("sfsfsf");
    console.log(matches);

    const titleHandle = !!handle && !!(handle as HandleType).title;

    useEffect(() => {
        const title = (handle as HandleType).title(data as string | undefined);

        if (title) document.title = title;

        if (themeDetector) {
            document.documentElement.setAttribute("theme-mode", "dark");
            return;
        }

        document.documentElement.removeAttribute("theme-mode");
    }, [data, handle, themeDetector, titleHandle]);

    return (
        <>
            <MenuBar />
            <Outlet />
            <Footer />
        </>
    );
}

export default App;
