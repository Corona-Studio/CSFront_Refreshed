// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import PageEntrance from "./page-entrance";

const state = vi.hoisted(() => ({ path: "/", allowed: true, animate: vi.fn(), cancel: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => state.path }));
vi.mock("./preferences", () => ({ useMotionAllowed: () => state.allowed }));
vi.mock("motion/mini", () => ({ animate: state.animate }));
afterEach(() => {
    cleanup();
    state.path = "/";
    state.allowed = true;
    vi.clearAllMocks();
});

it("keeps the first paint visible and animates subsequent navigation", () => {
    Object.defineProperty(HTMLElement.prototype, "animate", { configurable: true, value: vi.fn() });
    state.animate.mockReturnValue({ cancel: state.cancel });
    const { rerender, unmount } = render(<PageEntrance>Home</PageEntrance>);
    expect(state.animate).not.toHaveBeenCalled();
    state.path = "/lx";
    rerender(<PageEntrance>LauncherX</PageEntrance>);
    expect(state.animate).toHaveBeenCalledOnce();
    unmount();
    expect(state.cancel).toHaveBeenCalledOnce();
    delete (HTMLElement.prototype as unknown as { animate?: unknown }).animate;
});

it("leaves reduced-motion navigation static", () => {
    state.allowed = false;
    const { rerender } = render(<PageEntrance>Home</PageEntrance>);
    state.path = "/lx";
    rerender(<PageEntrance>LauncherX</PageEntrance>);
    expect(state.animate).not.toHaveBeenCalled();
});
