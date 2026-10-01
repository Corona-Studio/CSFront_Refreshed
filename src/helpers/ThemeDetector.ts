import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

const THEME_STORAGE_KEY = "theme";
const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";
const THEME_CHANGE_EVENT = "csfront:theme-change";

function getSystemTheme(): Theme {
    return window.matchMedia(DARK_MODE_QUERY).matches ? "dark" : "light";
}

export function getThemePreference(): ThemePreference {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === "dark" || storedTheme === "light" ? storedTheme : "system";
}

export function getTheme(): Theme {
    const preference = getThemePreference();
    return preference === "system" ? getSystemTheme() : preference;
}

export function applyTheme(theme: Theme): void {
    if (theme === "dark") document.documentElement.setAttribute("theme-mode", "dark");
    else document.documentElement.removeAttribute("theme-mode");
    document.documentElement.style.colorScheme = theme;
}

export function setTheme(theme: ThemePreference): void {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(getTheme());
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function subscribe(onStoreChange: () => void): () => void {
    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);
    const onSystemThemeChange = () => {
        if (getThemePreference() === "system") {
            applyTheme(getSystemTheme());
            onStoreChange();
        }
    };
    const onStorageChange = (event: StorageEvent) => {
        if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
        applyTheme(getTheme());
        onStoreChange();
    };

    mediaQuery.addEventListener("change", onSystemThemeChange);
    window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.addEventListener("storage", onStorageChange);

    return () => {
        mediaQuery.removeEventListener("change", onSystemThemeChange);
        window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
        window.removeEventListener("storage", onStorageChange);
    };
}

export function useTheme(): Theme {
    return useSyncExternalStore(subscribe, getTheme, () => "light");
}

export function useThemePreference(): ThemePreference {
    return useSyncExternalStore(subscribe, getThemePreference, () => "system");
}

export const useThemeDetector = () => useTheme() === "dark";

export const getCurrentPageTheme = () => getTheme() === "dark";
