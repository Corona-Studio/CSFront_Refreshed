// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StoredAuthExpired, StoredAuthToken } from "../requests/LxAuthRequests.ts";
import { isAdminSessionValidAsync, isUserSessionValidAsync } from "./SessionHelper.ts";

const state = vi.hoisted(() => ({ check: vi.fn(), remove: vi.fn() }));
vi.mock("@/lib/storage", () => ({ default: { getItem: vi.fn().mockResolvedValue(null), removeItem: state.remove } }));
vi.mock("../requests/LxUserRequests.ts", () => ({ checkUserIsPaidAsync: state.check }));

beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    sessionStorage.setItem(StoredAuthToken, "token");
    sessionStorage.setItem(StoredAuthExpired, new Date(Date.now() + 60_000).toISOString());
});

describe("server session validation", () => {
    it.each([401, 403, 423])("clears stale credentials when the server rejects the session with %s", async (status) => {
        state.check.mockResolvedValue({ status });
        expect(await isUserSessionValidAsync()).toBe(false);
        expect(sessionStorage.getItem(StoredAuthToken)).toBeNull();
        expect(state.remove).toHaveBeenCalledWith(StoredAuthToken);
    });
    it("checks the server even while the JWT has not expired", async () => {
        state.check.mockResolvedValue({ status: 200, response: false });
        expect(await isUserSessionValidAsync()).toBe(true);
        expect(state.check).toHaveBeenCalledWith("token");
    });
    it("does not erase credentials on a transient server failure", async () => {
        state.check.mockResolvedValue({ status: 500 });
        await expect(isUserSessionValidAsync()).rejects.toThrow();
        expect(sessionStorage.getItem(StoredAuthToken)).toBe("token");
    });
    it("rejects an admin token when the server rejects its account", async () => {
        state.check.mockResolvedValue({ status: 401 });
        expect(await isAdminSessionValidAsync(false)).toBe(false);
        expect(sessionStorage.getItem(StoredAuthToken)).toBeNull();
    });
});
