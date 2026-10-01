import type { NextConfig } from "next";

const config: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    async redirects() {
        return [{ source: "/launcherx/download", destination: "/lx/download", permanent: true }];
    }
};
export default config;
