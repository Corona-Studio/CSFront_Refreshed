import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
import { patchCssModules } from "vite-css-modules";
import Sitemap from "vite-plugin-sitemap";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    let config = loadEnv(mode, process.cwd());

    if (mode === "production") {
        config = loadEnv("", process.cwd());
    }

    const hostName = config.VITE_HOST_NAME || "http://localhost:5173";
    const pages = ["lx", "lx/download", "cmfs", "auth/login", "auth/register"];
    const externalUrls = ["https://kb.corona.studio/", "https://github.com/Corona-Studio/"];

    return {
        plugins: [
            patchCssModules(),
            react(),
            tailwindcss(),
            Sitemap({
                hostname: hostName,
                dynamicRoutes: pages,
                exclude: ["/admin", "/user"],
                externalSitemaps: externalUrls,
                robots: [
                    {
                        userAgent: "*",
                        allow: "/",
                        disallow: ["/admin", "/user"]
                    }
                ]
            })
        ]
    };
});
