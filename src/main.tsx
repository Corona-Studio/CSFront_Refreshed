import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { StrictMode } from "react";

import "./index.css";

import { createRoot } from "react-dom/client";

import "./i18n";

import "tdesign-react/dist/tdesign.css";
import { BrowserRouter, Route, Routes } from "react-router";

import App from "./App.tsx";
import MenuBar from "./components/MenuBar.tsx";
import Home from "./pages/Index.tsx";
import LxIndex from "./pages/LauncherX/Index.tsx";

import Footer from "./components/Footer.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Analytics />
            <SpeedInsights />

            <div className=" relative">
                <MenuBar />
                <div className="shadow-lg overflow-x-hidden ?overflow-y-auto my-[56px] z-10 bg-white dark:bg-zinc-900">
                    
                    <Routes>
                        <Route path="/" element={<App />}>
                            <Route index element={<Home />} />
                            <Route path="lx">
                                <Route index element={<LxIndex />} />
                            </Route>
                        </Route>
                    </Routes>
                </div>

                <Footer />
            </div>

        </BrowserRouter>
    </StrictMode>
);
