// @vitest-environment jsdom
import i18n from "@/i18n";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import LxHome from "./LxHome";

beforeEach(() => {
    vi.stubGlobal(
        "matchMedia",
        vi.fn(() => ({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        }))
    );
});

afterEach(async () => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    await i18n.changeLanguage("zhCN");
});

it("cycles all previews, resumes after pointer selection, and supports pausing", () => {
    vi.useFakeTimers();
    render(
        <I18nextProvider i18n={i18n}>
            <LxHome />
        </I18nextProvider>
    );
    const captions = ["你的冒险，从这里开始", "所有版本，井然有序", "发现下一场冒险", "让界面，成为你的风格"];
    for (const caption of [...captions.slice(1), captions[0]]) {
        act(() => vi.advanceTimersByTime(6000));
        expect(screen.getByRole("img", { name: caption })).toBeTruthy();
        expect(screen.getByRole("button", { name: caption }).getAttribute("aria-pressed")).toBe("true");
    }
    const selector = screen.getByRole("button", { name: captions[2] });
    fireEvent.pointerDown(selector);
    act(() => selector.focus());
    fireEvent.click(selector);
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getByRole("img", { name: captions[3] })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "暂停自动轮播" }));
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByRole("img", { name: captions[3] })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "继续自动轮播" }));
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getByRole("img", { name: captions[0] })).toBeTruthy();
});

it("switches screenshots and translates the selected preview when the language changes", async () => {
    await i18n.changeLanguage("zhCN");
    const user = userEvent.setup();
    render(
        <I18nextProvider i18n={i18n}>
            <LxHome />
        </I18nextProvider>
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("即刻启程探索无限可能 /");
    const versions = screen.getByRole("button", { name: "所有版本，井然有序" });
    versions.focus();
    await user.keyboard("{Enter}");
    expect(versions.getAttribute("aria-pressed")).toBe("true");
    const selectedImage = screen.getByRole("img", { name: "所有版本，井然有序" });
    expect(selectedImage.getAttribute("src")).toContain("LauncherX_2.webp");
    expect(screen.getByRole("button", { name: "你的冒险，从这里开始" }).getAttribute("aria-pressed")).toBe("false");
    await act(async () => {
        await i18n.changeLanguage("enUS");
    });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("LAUNCHWITHOUTLIMITS /");
    expect(screen.getByRole("img", { name: "Every version, in its place" }).getAttribute("src")).toContain(
        "LauncherX_2.webp"
    );
    expect(screen.getByRole("heading", { name: /Your launcher\.\s*Your style\./ })).toBeTruthy();
});
