import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { CSSProperties, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { BackTop } from "tdesign-react";
import "tdesign-react/dist/tdesign.css";

import { router } from "./Router.tsx";
import "./i18n";
import "./index.css";

const style: CSSProperties = {
    position: "fixed",
    insetInlineEnd: 24,
    insetBlockEnd: 80,
    zIndex: 9999
};

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Analytics />
        <SpeedInsights />

        <div className="relative shadow-lg">
            <div
                className="shadow-md overflow-x-hidden ?overflow-y-auto my-[56px] z-10 bg-zinc-100 dark:bg-zinc-900"
                id="wrapper">
                <RouterProvider router={router} />
            </div>

            <BackTop
                container={() => document}
                visibleHeight={100}
                style={style}
            />
        </div>
    </StrictMode>
);
