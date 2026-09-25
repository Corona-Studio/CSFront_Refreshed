import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import localForage from "localforage";
import { CSSProperties, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { RouterProvider } from "react-router";
import { BackTop } from "tdesign-react";
import "tdesign-react/es/_util/react-19-adapter";
import "tdesign-react/es/style/index.css";

import { router } from "./Router.tsx";
import { applyTheme, getTheme } from "./helpers/ThemeDetector.ts";
import "./i18n";
import "./index.css";

const style: CSSProperties = {
    position: "fixed",
    insetInlineEnd: 24,
    insetBlockEnd: 80
};

const vercelInsightsEnabled = import.meta.env.VITE_VERCEL_INSIGHTS === "true";

localForage.config({
    driver: localForage.INDEXEDDB,
    name: "CSFront",
    version: 1.0,
    storeName: "cs_front_kv",
    description: "This is the Key-Value store for CSFront."
});

// Remove credentials written by older versions. Passwords must never be persisted client-side.
void localForage.removeItem("AUTH_PASSWORD");

applyTheme(getTheme());

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Missing #root element");

createRoot(rootElement).render(
    <StrictMode>
        <HelmetProvider>
            {vercelInsightsEnabled && <Analytics />}
            {vercelInsightsEnabled && <SpeedInsights />}

            <div className="shadow-lg">
                <div className="shadow-md overflow-x-clip bg-zinc-100 dark:bg-zinc-900" id="wrapper">
                    <RouterProvider router={router} />
                </div>

                <BackTop container={() => document} visibleHeight={100} style={style} />
            </div>
        </HelmetProvider>
    </StrictMode>
);
