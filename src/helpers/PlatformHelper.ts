export type SupportedOperatingSystem = "Windows" | "macOS" | "Linux";

export interface PlatformInfo {
    os: SupportedOperatingSystem | "Unknown";
    arch: "Apple" | "Intel" | "Arm64" | "X64" | "Unknown";
}

const DETECTED_OS_KEY = "detectedOS";
const DETECTED_ARCH_KEY = "detectedArch";

export function detectPlatform(): PlatformInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    let os: PlatformInfo["os"] = "Unknown";
    let arch: PlatformInfo["arch"] = "Unknown";

    if (userAgent.includes("win")) os = "Windows";
    else if (userAgent.includes("mac")) os = "macOS";
    else if (userAgent.includes("linux")) os = "Linux";

    if (userAgent.includes("arm64") || userAgent.includes("aarch64")) {
        arch = os === "macOS" ? "Apple" : "Arm64";
    } else if (os === "macOS") {
        arch = "Intel";
    } else if (os !== "Unknown") {
        arch = "X64";
    }

    return { os, arch };
}

export function saveDetectedPlatform(platform: PlatformInfo): void {
    sessionStorage.setItem(DETECTED_OS_KEY, platform.os);
    sessionStorage.setItem(DETECTED_ARCH_KEY, platform.arch);
}

export function getSavedOperatingSystem(): string | null {
    return sessionStorage.getItem(DETECTED_OS_KEY);
}
