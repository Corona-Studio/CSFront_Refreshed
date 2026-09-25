import { afterEach, describe, expect, it, vi } from "vitest";

import { applyTheme } from "./ThemeDetector.ts";

describe("applyTheme", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("applies the dark theme attribute and color scheme", () => {
        const documentElement = {
            removeAttribute: vi.fn(),
            setAttribute: vi.fn(),
            style: { colorScheme: "" }
        };
        vi.stubGlobal("document", { documentElement });

        applyTheme("dark");

        expect(documentElement.setAttribute).toHaveBeenCalledWith("theme-mode", "dark");
        expect(documentElement.style.colorScheme).toBe("dark");
    });

    it("removes the dark theme attribute for light mode", () => {
        const documentElement = {
            removeAttribute: vi.fn(),
            setAttribute: vi.fn(),
            style: { colorScheme: "" }
        };
        vi.stubGlobal("document", { documentElement });

        applyTheme("light");

        expect(documentElement.removeAttribute).toHaveBeenCalledWith("theme-mode");
        expect(documentElement.style.colorScheme).toBe("light");
    });
});
