import { useSyncExternalStore } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { applyTheme, getTheme, getThemePreference, setTheme, useTheme, useThemePreference } from "./ThemeDetector.ts";

vi.mock("react", () => ({ useSyncExternalStore: vi.fn() }));

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

describe("theme preferences", () => {
    let storedValues: Map<string, string>;
    let mediaQuery: EventTarget & { matches: boolean };
    let browserWindow: EventTarget;
    let documentElement: {
        setAttribute: ReturnType<typeof vi.fn>;
        removeAttribute: ReturnType<typeof vi.fn>;
        style: { colorScheme: string };
    };

    beforeEach(() => {
        storedValues = new Map();
        mediaQuery = Object.assign(new EventTarget(), { matches: false });
        browserWindow = new EventTarget();
        documentElement = { setAttribute: vi.fn(), removeAttribute: vi.fn(), style: { colorScheme: "" } };
        vi.stubGlobal("document", { documentElement });
        vi.stubGlobal("window", Object.assign(browserWindow, { matchMedia: vi.fn(() => mediaQuery) }));
        vi.stubGlobal("localStorage", {
            getItem: (key: string) => storedValues.get(key) ?? null,
            setItem: (key: string, value: string) => storedValues.set(key, value)
        });
        vi.mocked(useSyncExternalStore).mockClear();
    });

    afterEach(() => vi.unstubAllGlobals());

    function useThemeSubscription(onChange = vi.fn()) {
        useTheme();
        const subscribe = vi.mocked(useSyncExternalStore).mock.calls[0][0];
        return { onChange, unsubscribe: subscribe(onChange) };
    }

    it("defaults to the system theme for missing or invalid preferences", () => {
        mediaQuery.matches = true;
        expect(getThemePreference()).toBe("system");
        expect(getTheme()).toBe("dark");
        storedValues.set("theme", "invalid");
        expect(getThemePreference()).toBe("system");
        expect(getTheme()).toBe("dark");
    });

    it.each(["light", "dark"] as const)("preserves existing %s preferences regardless of the system", (theme) => {
        storedValues.set("theme", theme);
        mediaQuery.matches = theme !== "dark";
        expect(getThemePreference()).toBe(theme);
        expect(getTheme()).toBe(theme);
    });

    it.each(["light", "dark", "system"] as const)("persists and applies the %s selection", (preference) => {
        mediaQuery.matches = true;
        const onChange = vi.fn();
        browserWindow.addEventListener("csfront:theme-change", onChange);
        setTheme(preference);
        expect(storedValues.get("theme")).toBe(preference);
        expect(getThemePreference()).toBe(preference);
        expect(documentElement.style.colorScheme).toBe(preference === "system" ? "dark" : preference);
        expect(onChange).toHaveBeenCalledOnce();
    });

    it("follows live system changes after switching back from a manual preference", () => {
        setTheme("light");
        const { onChange, unsubscribe } = useThemeSubscription();
        setTheme("system");
        onChange.mockClear();
        mediaQuery.matches = true;
        mediaQuery.dispatchEvent(new Event("change"));
        expect(getTheme()).toBe("dark");
        expect(documentElement.style.colorScheme).toBe("dark");
        expect(storedValues.get("theme")).toBe("system");
        expect(onChange).toHaveBeenCalledOnce();
        mediaQuery.matches = false;
        mediaQuery.dispatchEvent(new Event("change"));
        expect(documentElement.style.colorScheme).toBe("light");
        unsubscribe();
        onChange.mockClear();
        mediaQuery.dispatchEvent(new Event("change"));
        browserWindow.dispatchEvent(new Event("csfront:theme-change"));
        expect(onChange).not.toHaveBeenCalled();
    });

    it("ignores system changes while a manual theme is selected", () => {
        setTheme("light");
        const { onChange, unsubscribe } = useThemeSubscription();
        mediaQuery.matches = true;
        mediaQuery.dispatchEvent(new Event("change"));
        expect(documentElement.style.colorScheme).toBe("light");
        expect(onChange).not.toHaveBeenCalled();
        unsubscribe();
    });

    it("applies theme changes from other tabs and storage clearing", () => {
        const { onChange, unsubscribe } = useThemeSubscription();
        storedValues.set("theme", "dark");
        browserWindow.dispatchEvent(Object.assign(new Event("storage"), { key: "theme" }));
        expect(documentElement.style.colorScheme).toBe("dark");
        expect(onChange).toHaveBeenCalledOnce();
        storedValues.clear();
        browserWindow.dispatchEvent(Object.assign(new Event("storage"), { key: null }));
        expect(documentElement.style.colorScheme).toBe("light");
        onChange.mockClear();
        browserWindow.dispatchEvent(Object.assign(new Event("storage"), { key: "language" }));
        expect(onChange).not.toHaveBeenCalled();
        unsubscribe();
    });

    it("exposes the selected preference separately from the resolved theme", () => {
        setTheme("system");
        useThemePreference();
        const [, getSnapshot] = vi.mocked(useSyncExternalStore).mock.calls[0];
        expect(getSnapshot()).toBe("system");
        expect(getTheme()).toBe("light");
    });
});
