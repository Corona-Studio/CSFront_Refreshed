import { afterEach, describe, expect, it, vi } from "vitest";

import { detectPlatform, detectPlatformAsync } from "./PlatformHelper.ts";

const macUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)";

function mockRenderer(renderer: string | null) {
    const loseContext = vi.fn();
    const getContext = vi.fn(() => ({
        getExtension: vi.fn((name: string) => {
            if (name === "WEBGL_lose_context") return { loseContext };
            return renderer === null ? null : { UNMASKED_RENDERER_WEBGL: 37446 };
        }),
        getParameter: vi.fn(() => renderer)
    }));
    vi.stubGlobal("document", { createElement: vi.fn(() => ({ getContext })) });
    return { getContext, loseContext };
}

describe("detectPlatform", () => {
    afterEach(() => vi.unstubAllGlobals());

    it.each([
        ["Mozilla/5.0 (Windows NT 10.0; Win64; x64)", { os: "Windows", arch: "X64" }],
        [macUserAgent, { os: "macOS", arch: "Unknown" }],
        ["Mozilla/5.0 (Macintosh; ARM64 Mac OS X)", { os: "macOS", arch: "Apple" }],
        ["Mozilla/5.0 (X11; Linux aarch64)", { os: "Linux", arch: "Arm64" }],
        ["Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X)", { os: "Unknown", arch: "Unknown" }],
        ["Mozilla/5.0 (Linux; Android 16; arm64)", { os: "Unknown", arch: "Unknown" }]
    ])("detects %s", (userAgent, expected) => {
        vi.stubGlobal("navigator", { userAgent });
        expect(detectPlatform()).toEqual(expected);
    });

    it("does not recommend a Mac build for an iPad in desktop mode", async () => {
        vi.stubGlobal("navigator", { userAgent: macUserAgent, platform: "MacIntel", maxTouchPoints: 5 });
        expect(await detectPlatformAsync()).toEqual({ os: "Unknown", arch: "Unknown" });
    });

    it("supports server rendering without navigator", async () => {
        vi.stubGlobal("navigator", undefined);
        expect(await detectPlatformAsync()).toEqual({ os: "Unknown", arch: "Unknown" });
    });

    it.each([
        [macUserAgent, "arm", "64", { os: "macOS", arch: "Apple" }],
        [macUserAgent, "x86", "64", { os: "macOS", arch: "Intel" }],
        ["Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "arm", "64", { os: "Windows", arch: "Arm64" }],
        ["Mozilla/5.0 (X11; Linux x86_64)", "arm", "64", { os: "Linux", arch: "Arm64" }]
    ])("uses client hints for %s / %s", async (userAgent, architecture, bitness, expected) => {
        const getHighEntropyValues = vi.fn().mockResolvedValue({ architecture, bitness });
        vi.stubGlobal("navigator", { userAgent, userAgentData: { getHighEntropyValues } });
        const { getContext } = mockRenderer("Intel Iris");
        expect(await detectPlatformAsync()).toEqual(expected);
        expect(getHighEntropyValues).toHaveBeenCalledWith(["architecture", "bitness"]);
        if (expected.arch !== "Intel") expect(getContext).not.toHaveBeenCalled();
    });

    it.each([
        ["Apple GPU", "Apple"],
        ["ANGLE (Apple, ANGLE Metal Renderer: Apple M4 Pro, Unspecified Version)", "Apple"],
        ["Intel Iris OpenGL Engine", "Intel"],
        ["AMD Radeon Pro 5500M OpenGL Engine", "Intel"],
        ["Apple", "Unknown"],
        ["WebKit WebGL", "Unknown"],
        [null, "Unknown"]
    ])("falls back to renderer %s", async (renderer, arch) => {
        vi.stubGlobal("navigator", { userAgent: macUserAgent });
        const { loseContext } = mockRenderer(renderer);
        expect(await detectPlatformAsync()).toEqual({ os: "macOS", arch });
        expect(loseContext).toHaveBeenCalledOnce();
    });

    it("recognizes Apple Silicon when an Intel browser runs under Rosetta", async () => {
        vi.stubGlobal("navigator", {
            userAgent: macUserAgent,
            userAgentData: { getHighEntropyValues: vi.fn().mockResolvedValue({ architecture: "x86", bitness: "64" }) }
        });
        mockRenderer("ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)");
        expect(await detectPlatformAsync()).toEqual({ os: "macOS", arch: "Apple" });
    });

    it("falls back when client hints are denied", async () => {
        vi.stubGlobal("navigator", {
            userAgent: macUserAgent,
            userAgentData: { getHighEntropyValues: vi.fn().mockRejectedValue(new Error("Denied")) }
        });
        mockRenderer("Apple GPU");
        expect(await detectPlatformAsync()).toEqual({ os: "macOS", arch: "Apple" });
    });

    it("keeps Mac architecture unknown when WebGL is disabled", async () => {
        vi.stubGlobal("navigator", { userAgent: macUserAgent });
        vi.stubGlobal("document", { createElement: () => ({ getContext: () => null }) });
        expect(await detectPlatformAsync()).toEqual({ os: "macOS", arch: "Unknown" });
    });

    it("handles renderer access restrictions", async () => {
        vi.stubGlobal("navigator", { userAgent: macUserAgent });
        vi.stubGlobal("document", {
            createElement: () => {
                throw new Error("Blocked");
            }
        });
        expect(await detectPlatformAsync()).toEqual({ os: "macOS", arch: "Unknown" });
    });
});
