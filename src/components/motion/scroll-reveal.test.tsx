// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { ScrollReveal } from "./scroll-reveal";

const animation = vi.hoisted(() => ({ cancel: vi.fn(), stopScroll: vi.fn(), start: vi.fn(), link: vi.fn() }));
vi.mock("motion/mini", () => ({ animate: animation.start }));
vi.mock("motion", () => ({ scroll: animation.link }));
let reduced = false;
const listeners = new Set<() => void>();

beforeEach(() => {
    reduced = false;
    animation.start.mockReturnValue({ cancel: animation.cancel });
    animation.link.mockReturnValue(animation.stopScroll);
    vi.stubGlobal("matchMedia", (query: string) => ({
        matches: query.includes("prefers-reduced-motion") ? reduced : false,
        addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener)
    }));
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top: 1200 } as DOMRect);
    Object.defineProperty(HTMLElement.prototype, "animate", { configurable: true, value: vi.fn() });
});
afterEach(() => {
    cleanup();
    listeners.clear();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    delete (HTMLElement.prototype as unknown as { animate?: unknown }).animate;
});

it("serves readable content without hydration and preserves semantic markup", () => {
    const html = renderToString(
        <ScrollReveal asChild>
            <article>
                <h2>Product details</h2>
            </article>
        </ScrollReveal>
    );
    expect(html).toContain("<article");
    expect(html).toContain("Product details");
    expect(html).not.toContain("opacity");
    expect(animation.start).not.toHaveBeenCalled();
});

it("leaves the first viewport and restored destinations visible", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top: 100 } as DOMRect);
    render(<ScrollReveal>Visible on arrival</ScrollReveal>);
    expect(animation.start).not.toHaveBeenCalled();
});

it("reveals a partially faded link immediately when keyboard focus reaches it", () => {
    render(
        <ScrollReveal asChild>
            <a href="#details">Explore details</a>
        </ScrollReveal>
    );
    expect(animation.start).toHaveBeenCalledOnce();
    fireEvent.focusIn(screen.getByRole("link"));
    expect(animation.stopScroll).toHaveBeenCalledOnce();
    expect(animation.cancel).toHaveBeenCalledOnce();
});

it("cancels scroll animations when reduced motion is enabled during a visit", () => {
    render(<ScrollReveal>Product details</ScrollReveal>);
    expect(animation.start).toHaveBeenCalledOnce();
    act(() => {
        reduced = true;
        listeners.forEach((listener) => listener());
    });
    expect(animation.stopScroll).toHaveBeenCalledOnce();
    expect(animation.cancel).toHaveBeenCalledOnce();
    expect(screen.getByText("Product details")).toBeTruthy();
});

it("starts static when reduced motion is already enabled and cleans up on navigation", () => {
    reduced = true;
    const { unmount } = render(<ScrollReveal>Product details</ScrollReveal>);
    expect(animation.start).not.toHaveBeenCalled();
    act(() => {
        reduced = false;
        listeners.forEach((listener) => listener());
    });
    expect(animation.start).toHaveBeenCalledOnce();
    unmount();
    expect(animation.stopScroll).toHaveBeenCalledOnce();
    expect(animation.cancel).toHaveBeenCalledOnce();
});
