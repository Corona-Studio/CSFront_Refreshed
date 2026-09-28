import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, useEffect, useState } from "react";
import { Outlet, useLocation, useMatches, useNavigation } from "react-router";

import "./App.css";
import { queryClient } from "./app/queryClient.ts";
import { RouteHandle } from "./app/routeTypes.ts";
import { applyTheme, useTheme } from "./helpers/ThemeDetector.ts";
import Fallback from "./pages/Fallback.tsx";

const Footer = lazy(() => import("./components/Footer.tsx"));
const MenuBar = lazy(() => import("./components/MenuBar.tsx"));

function App() {
    const navigation = useNavigation();
    const location = useLocation();
    const [requestedPath, setRequestedPath] = useState<string>();
    useEffect(() => {
        if (!requestedPath || navigation.state !== "idle") return;
        const timer = window.setTimeout(
            () => setRequestedPath(undefined),
            location.pathname === requestedPath ? 400 : 600
        );
        return () => window.clearTimeout(timer);
    }, [location.pathname, navigation.state, requestedPath]);

    const isLoading = navigation.state !== "idle" || Boolean(requestedPath);
    const isManagementPage = /^\/(admin|user)(\/|$)/.test(location.pathname);
    const pendingPath = navigation.location?.pathname;
    const isPendingManagementPage = pendingPath ? /^\/(admin|user)(\/|$)/.test(pendingPath) : false;
    const showPageFallback = navigation.state !== "idle" && (!isManagementPage || !isPendingManagementPage);
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
                <MenuBar requestedPath={requestedPath} onNavigationStart={setRequestedPath} />

                <div
                    className={`route-progress ${isLoading ? "route-progress--active" : ""}`}
                    role="progressbar"
                    aria-label="页面加载中"
                    aria-valuetext={isLoading ? "加载中" : "已完成"}>
                    <span />
                </div>

                {showPageFallback ? <Fallback pathname={pendingPath} /> : <Outlet />}

                {!isManagementPage && <Footer />}
            </QueryClientProvider>
        </>
    );
}

export default App;
