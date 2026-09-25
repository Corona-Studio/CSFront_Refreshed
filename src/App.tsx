import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, useEffect } from "react";
import { Outlet, useLocation, useMatches, useNavigation } from "react-router";

import "./App.css";
import { queryClient } from "./app/queryClient.ts";
import { RouteHandle } from "./app/routeTypes.ts";
import { applyTheme, useTheme } from "./helpers/ThemeDetector.ts";

const Fallback = lazy(() => import("./pages/Fallback.tsx"));
const Footer = lazy(() => import("./components/Footer.tsx"));
const MenuBar = lazy(() => import("./components/MenuBar.tsx"));

function App() {
    const navigation = useNavigation();
    const location = useLocation();
    const isManagementPage = /^\/(admin|user)(\/|$)/.test(location.pathname);
    const theme = useTheme();
    const matches = useMatches();
    const currentMatch = matches[matches.length - 1];
    const handle = currentMatch?.handle as RouteHandle | undefined;

    useEffect(() => {
        const title = handle?.title?.(currentMatch?.loaderData);
        if (title) document.title = title;
        applyTheme(theme);
    }, [currentMatch?.loaderData, handle, theme]);

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <MenuBar />

                {navigation.state === "loading" && <Fallback />}
                {navigation.state !== "loading" && <Outlet />}

                {!isManagementPage && <Footer />}
            </QueryClientProvider>
        </>
    );
}

export default App;
