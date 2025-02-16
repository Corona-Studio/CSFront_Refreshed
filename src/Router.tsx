import {
    Route,
    createBrowserRouter,
    createRoutesFromElements
} from "react-router";

import App from "./App.tsx";
import Fallback from "./pages/Fallback.tsx";
import Home from "./pages/Home.tsx";
import LxIndex from "./pages/LauncherX/LxHome.tsx";

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />} hydrateFallbackElement={<Fallback />}>
            <Route index element={<Home />} />
            <Route path="lx">
                <Route index element={<LxIndex />} />
                <Route
                    path="download"
                    lazy={() => import("./pages/LauncherX/LxDownload.tsx")}
                />
            </Route>
        </Route>
    )
);
