export type SupportedOperatingSystem = "Windows" | "macOS" | "Linux";

export interface PlatformInfo {
    os: SupportedOperatingSystem | "Unknown";
    arch: "Apple" | "Intel" | "Arm64" | "X64" | "Unknown";
}

const DETECTED_OS_KEY = "detectedOS";
const DETECTED_ARCH_KEY = "detectedArch";

export function detectPlatform(): PlatformInfo {
    if (typeof navigator === "undefined") return { os: "Unknown", arch: "Unknown" };
    const userAgent = navigator.userAgent.toLowerCase();
    let os: PlatformInfo["os"] = "Unknown";
    let arch: PlatformInfo["arch"] = "Unknown";

    // iPad desktop mode also advertises Macintosh, but cannot run desktop builds.
    if (
        /iphone|ipad|ipod|android/.test(userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    ) {
        return { os, arch };
    }

    if (userAgent.includes("win")) os = "Windows";
    else if (userAgent.includes("mac")) os = "macOS";
    else if (userAgent.includes("linux")) os = "Linux";

    if (userAgent.includes("arm64") || userAgent.includes("aarch64")) {
        arch = os === "macOS" ? "Apple" : "Arm64";
    } else if (os !== "Unknown" && os !== "macOS") {
        arch = "X64";
    }

    return { os, arch };
}

interface NavigatorWithArchitecture extends Navigator {
    userAgentData?: {
        getHighEntropyValues(hints: string[]): Promise<{ architecture?: string; bitness?: string }>;
    };
}

function detectMacGraphicsArchitecture(): PlatformInfo["arch"] {
    if (typeof document === "undefined") return "Unknown";
    let gl: WebGLRenderingContext | null = null;
    try {
        gl = document.createElement("canvas").getContext("webgl");
        if (!gl) return "Unknown";
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        if (!info) return "Unknown";
        const renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
        if (/apple (?:gpu|m\d)/i.test(renderer)) return "Apple";
        if (/intel|amd|radeon|nvidia/i.test(renderer)) return "Intel";
    } catch {
        // Privacy settings or disabled WebGL may hide the renderer.
    } finally {
        try {
            gl?.getExtension("WEBGL_lose_context")?.loseContext();
        } catch {
            // Context cleanup is best effort when browser APIs are restricted.
        }
    }
    return "Unknown";
}

export async function detectPlatformAsync(): Promise<PlatformInfo> {
    const platform = detectPlatform();
    if (platform.os === "Unknown") return platform;

    try {
        const data = await (navigator as NavigatorWithArchitecture).userAgentData?.getHighEntropyValues([
            "architecture",
            "bitness"
        ]);
        const architecture = data?.architecture?.toLowerCase();
        if (
            (architecture === "arm" && data?.bitness === "64") ||
            architecture === "arm64" ||
            architecture === "aarch64"
        ) {
            return { os: platform.os, arch: platform.os === "macOS" ? "Apple" : "Arm64" };
        }
        if ((architecture === "x86" && data?.bitness === "64") || architecture === "x86_64" || architecture === "x64") {
            if (platform.os === "macOS") {
                // An Intel browser running under Rosetta can report x86 on Apple Silicon.
                const graphicsArch = detectMacGraphicsArchitecture();
                return { os: platform.os, arch: graphicsArch === "Apple" ? "Apple" : "Intel" };
            }
            return { os: platform.os, arch: "X64" };
        }
    } catch {
        // Client hints are optional and can be denied by browser policy.
    }

    if (platform.os === "macOS" && platform.arch === "Unknown") {
        return { os: platform.os, arch: detectMacGraphicsArchitecture() };
    }
    return platform;
}

export function saveDetectedPlatform(platform: PlatformInfo): void {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(DETECTED_OS_KEY, platform.os);
    sessionStorage.setItem(DETECTED_ARCH_KEY, platform.arch);
}

export function getSavedOperatingSystem(): string | null {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage.getItem(DETECTED_OS_KEY);
}
