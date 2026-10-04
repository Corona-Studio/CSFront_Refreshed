import type { NextConfig } from "next";

const config: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    experimental: { optimizePackageImports: ["radix-ui", "motion", "@/components/marathon"] },
    async redirects() {
        return [{ source: "/launcherx/download", destination: "/lx/download", permanent: true }];
    }
};
export default config;
