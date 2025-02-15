import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { BrowserRouter, Route, Routes } from "react-router";

import "./i18n";

import "tdesign-react/dist/tdesign.css";

import App from "./App.tsx";
import Home from "./pages/Index.tsx";
import LxIndex from "./pages/LauncherX/Index.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
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
