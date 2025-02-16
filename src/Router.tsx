import i18next from "i18next";
import { Route, createBrowserRouter, createRoutesFromElements } from "react-router";

import App from "./App.tsx";
import Fallback from "./pages/Fallback.tsx";
import Home from "./pages/Home.tsx";
import LxIndex from "./pages/LauncherX/LxHome.tsx";

const t = i18next.t;

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />} hydrateFallbackElement={<Fallback />}>
            <Route index element={<Home />} handle={{ title: () => "Corona Studio" }} />
            <Route path="lx">
                <Route index element={<LxIndex />} handle={{ title: () => "LauncherX" }} />
                <Route
                    path="download"
                    handle={{ title: () => `LauncherX - ${t("download")}` }}
                    lazy={() => import("./pages/LauncherX/LxDownload.tsx")}
                />
            </Route>
        </Route>
    )
);
