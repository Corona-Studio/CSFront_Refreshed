import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";
const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";
const THEME_CHANGE_EVENT = "csfront:theme-change";

function getSystemTheme(): Theme {
    return window.matchMedia(DARK_MODE_QUERY).matches ? "dark" : "light";
}

export function getTheme(): Theme {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === "dark" || storedTheme === "light" ? storedTheme : getSystemTheme();
}

export function applyTheme(theme: Theme): void {
    if (theme === "dark") document.documentElement.setAttribute("theme-mode", "dark");
    else document.documentElement.removeAttribute("theme-mode");
    document.documentElement.style.colorScheme = theme;
}

export function setTheme(theme: Theme): void {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function subscribe(onStoreChange: () => void): () => void {
    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);
    const onSystemThemeChange = () => {
        if (localStorage.getItem(THEME_STORAGE_KEY) === null) {
            applyTheme(getSystemTheme());
            onStoreChange();
        }
    };

    mediaQuery.addEventListener("change", onSystemThemeChange);
    window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.addEventListener("storage", onStoreChange);

    return () => {
        mediaQuery.removeEventListener("change", onSystemThemeChange);
        window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
        window.removeEventListener("storage", onStoreChange);
    };
}

export function useTheme(): Theme {
    return useSyncExternalStore(subscribe, getTheme, () => "light");
}

export const useThemeDetector = () => useTheme() === "dark";

export const getCurrentPageTheme = () => getTheme() === "dark";
