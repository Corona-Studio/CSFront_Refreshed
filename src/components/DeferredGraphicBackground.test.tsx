// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";

import DeferredGraphicBackground from "./DeferredGraphicBackground";

vi.mock("next/dynamic", () => ({ default: () => () => <canvas data-testid="webgl" /> }));
afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

it("serves a static background without requesting WebGL during SSR", () => {
    const html = renderToString(<DeferredGraphicBackground />);
    expect(html).toContain("FIELD STUDY");
    expect(html).not.toContain("<canvas");
});

it("waits for critical resources and idle time and cancels work on navigation", () => {
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
    const idle = vi.fn();
    const cancel = vi.fn();
    vi.stubGlobal("requestIdleCallback", idle.mockReturnValue(7));
    vi.stubGlobal("cancelIdleCallback", cancel);
    const { unmount } = render(<DeferredGraphicBackground />);
    expect(idle).not.toHaveBeenCalled();
    act(() => window.dispatchEvent(new Event("load")));
    expect(idle).toHaveBeenCalledOnce();
    unmount();
    expect(cancel).toHaveBeenCalledWith(7);
});

it("enhances the shell once the browser is idle", () => {
    vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
    const idle = vi.fn().mockReturnValue(3);
    vi.stubGlobal("requestIdleCallback", idle);
    vi.stubGlobal("cancelIdleCallback", vi.fn());
    const { queryByTestId } = render(<DeferredGraphicBackground />);
    expect(queryByTestId("webgl")).toBeNull();
    act(() => idle.mock.calls[0][0]());
    expect(queryByTestId("webgl")).toBeTruthy();
});
