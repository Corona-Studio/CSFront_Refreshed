import { afterEach, describe, expect, it, vi } from "vitest";

import { detectPlatform } from "./PlatformHelper.ts";

describe("detectPlatform", () => {
    afterEach(() => vi.unstubAllGlobals());

    it.each([
        ["Mozilla/5.0 (Windows NT 10.0; Win64; x64)", { os: "Windows", arch: "X64" }],
        ["Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", { os: "macOS", arch: "Intel" }],
        ["Mozilla/5.0 (Macintosh; ARM64 Mac OS X)", { os: "macOS", arch: "Apple" }],
        ["Mozilla/5.0 (X11; Linux aarch64)", { os: "Linux", arch: "Arm64" }]
    ])("detects %s", (userAgent, expected) => {
        vi.stubGlobal("navigator", { userAgent });
        expect(detectPlatform()).toEqual(expected);
    });
});
