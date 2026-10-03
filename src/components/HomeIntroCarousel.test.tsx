// @vitest-environment jsdom
import i18n from "@/i18n";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import HomeIntroCarousel from "./HomeIntroCarousel";

beforeEach(async () => {
    await i18n.changeLanguage("zhCN");
    vi.useFakeTimers();
    vi.stubGlobal(
        "matchMedia",
        vi.fn(() => ({ matches: false }))
    );
});

afterEach(async () => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    await i18n.changeLanguage("zhCN");
});

function renderCarousel() {
    render(
        <I18nextProvider i18n={i18n}>
            <HomeIntroCarousel />
        </I18nextProvider>
    );
}

it("cycles introductions and their destinations together, including wrapping to LauncherX", () => {
    renderCarousel();
    expect(screen.getByRole("link", { name: "下载 LauncherX" }).getAttribute("href")).toBe("/lx/download");
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getByRole("link", { name: "探索 ProjBobcat" }).getAttribute("href")).toBe(
        "https://github.com/Corona-Studio/ProjBobcat"
    );
    expect(screen.getByRole("button", { name: "查看 ProjBobcat 介绍" }).getAttribute("aria-pressed")).toBe("true");
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getByRole("link", { name: "探索 ConnectX" }).getAttribute("href")).toBe(
        "https://github.com/Corona-Studio/ConnectX"
    );
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getByRole("link", { name: "下载 LauncherX" })).toBeTruthy();
});

it("supports manual selection and translates the currently selected action", async () => {
    renderCarousel();
    fireEvent.click(screen.getByRole("button", { name: "查看 ConnectX 介绍" }));
    const action = screen.getByRole("link", { name: "探索 ConnectX" });
    expect(action.getAttribute("target")).toBe("_blank");
    expect(action.getAttribute("rel")).toBe("noopener noreferrer");
    await act(() => i18n.changeLanguage("enUS"));
    expect(screen.getByRole("link", { name: "Explore ConnectX" }).getAttribute("href")).toBe(
        "https://github.com/Corona-Studio/ConnectX"
    );
    expect(screen.queryByRole("link", { name: "Download LauncherX" })).toBeNull();
});

it("pauses while hovering, focusing, or explicitly paused", () => {
    renderCarousel();
    const region = screen.getByRole("region");
    fireEvent.mouseEnter(region);
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByRole("link", { name: "下载 LauncherX" })).toBeTruthy();
    fireEvent.mouseLeave(region);
    const action = screen.getByRole("link", { name: "下载 LauncherX" });
    fireEvent.focus(action);
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByRole("link", { name: "下载 LauncherX" })).toBeTruthy();
    fireEvent.blur(action, { relatedTarget: document.body });
    fireEvent.click(screen.getByRole("button", { name: "暂停自动轮播" }));
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByRole("link", { name: "下载 LauncherX" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "继续自动轮播" }));
    act(() => vi.advanceTimersByTime(6000));
    expect(screen.getByRole("link", { name: "探索 ProjBobcat" })).toBeTruthy();
});

it("keeps automatic motion off for reduced-motion users while allowing selection", () => {
    vi.stubGlobal(
        "matchMedia",
        vi.fn(() => ({ matches: true }))
    );
    renderCarousel();
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByRole("link", { name: "下载 LauncherX" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "查看 ConnectX 介绍" }));
    expect(screen.getByRole("link", { name: "探索 ConnectX" })).toBeTruthy();
});
