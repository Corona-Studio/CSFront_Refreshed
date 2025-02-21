import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, useEffect } from "react";
import { Outlet, useMatches, useNavigation } from "react-router";

import "./App.css";
import { useThemeDetector } from "./helpers/ThemeDetector.ts";
import IMatches from "./interfaces/IMatches.ts";

const queryClient = new QueryClient();

const Fallback = lazy(() => import("./pages/Fallback.tsx"));
const Footer = lazy(() => import("./components/Footer.tsx"));
const MenuBar = lazy(() => import("./components/MenuBar.tsx"));

interface HandleType {
    title: (param?: string) => string;
}

function App() {
    const navigation = useNavigation();
    const themeDetector = useThemeDetector();
    const matches = useMatches() as IMatches[];
    const { handle, data } = matches[matches.length - 1];

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
            <QueryClientProvider client={queryClient}>
                <MenuBar />

                {navigation.state === "loading" && <Fallback />}

                {navigation.state !== "loading" && <Outlet />}
                <Footer />
            </QueryClientProvider>
        </>
    );
}

export default App;
