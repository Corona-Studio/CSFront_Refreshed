import i18next from "i18next";
import { lazy } from "react";
import { Route, createBrowserRouter, createRoutesFromElements } from "react-router";

const App = lazy(() => import("./App.tsx"));
const Fallback = lazy(() => import("./pages/Fallback.tsx"));
const Home = lazy(() => import("./pages/Home.tsx"));
const LxIndex = lazy(() => import("./pages/LauncherX/LxHome.tsx"));
const CMFS = lazy(() => import("./pages/CMFS.tsx"));

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
            <Route path="cmfs" element={<CMFS />} handle={{ title: () => "CMFS" }} />
        </Route>
    )
);
