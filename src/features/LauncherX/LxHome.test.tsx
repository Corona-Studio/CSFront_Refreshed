// @vitest-environment jsdom
import i18n from "@/i18n";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, expect, it } from "vitest";

import LxHome from "./LxHome";

afterEach(async () => {
    cleanup();
    await i18n.changeLanguage("zhCN");
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
