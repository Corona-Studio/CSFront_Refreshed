import { SpeedInsights } from "@vercel/speed-insights/react";
import { StrictMode } from "react";

import "./index.css";

import { createRoot } from "react-dom/client";

import "./i18n";

import "tdesign-react/dist/tdesign.css";
import { BrowserRouter, Route, Routes } from "react-router";

import App from "./App.tsx";
import Home from "./pages/Index.tsx";
import LxIndex from "./pages/LauncherX/Index.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <SpeedInsights />
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index element={<Home />} />
                    <Route path="lx">
                        <Route index element={<LxIndex />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
