// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ConsoleShell from "./console-shell";

const state = vi.hoisted(() => ({ path: "/admin/users", replace: vi.fn(), admin: vi.fn(), user: vi.fn() }));
vi.mock("next/navigation", () => ({
    usePathname: () => state.path,
    useRouter: () => ({ replace: state.replace }),
    useSearchParams: () => new URLSearchParams()
}));
vi.mock("@/helpers/SessionHelper", () => ({
    isAdminSessionValidAsync: state.admin,
    isUserSessionValidAsync: state.user
}));
vi.mock("react-i18next", async (importOriginal) => ({
    ...(await importOriginal<typeof import("react-i18next")>()),
    useTranslation: () => ({ t: (key: string) => key })
}));
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    state.path = "/admin/users";
});
describe("Console session gate", () => {
    it("does not mount protected children while authorization is pending or denied", async () => {
        let resolve: (valid: boolean) => void = () => {};
        state.admin.mockReturnValue(
            new Promise<boolean>((r) => {
                resolve = r;
            })
        );
        render(
            <ConsoleShell admin>
                <div>Protected data</div>
            </ConsoleShell>
        );
        expect(screen.queryByText("Protected data")).toBeNull();
        resolve(false);
        await waitFor(() => expect(state.replace).toHaveBeenCalledWith("/auth/login?redirect=%2Fadmin%2Fusers"));
        expect(screen.queryByText("Protected data")).toBeNull();
    });
    it("mounts children after validation and validates the next protected path before mounting it", async () => {
        state.admin.mockResolvedValueOnce(true).mockReturnValue(new Promise(() => {}));
        const { rerender } = render(
            <ConsoleShell admin>
                <div>Users data</div>
            </ConsoleShell>
        );
        expect(await screen.findByText("Users data")).toBeTruthy();
        state.path = "/admin/builds";
        rerender(
            <ConsoleShell admin>
                <div>Build data</div>
            </ConsoleShell>
        );
        expect(screen.queryByText("Build data")).toBeNull();
    });
});
