import { afterEach, expect, it } from "vitest";

import { resetAdminUserAvatarAsync, setAdminUserLoginBanAsync } from "./AdminRequests.ts";
import { csBackend, isSuccessfulResponse } from "./ApiConstants.ts";

const originalAdapter = csBackend.defaults.adapter;
afterEach(() => {
    csBackend.defaults.adapter = originalAdapter;
});

it("uses the admin-only avatar reset endpoint and accepts an empty 204 response", async () => {
    csBackend.defaults.adapter = async (config) => {
        expect(config.url).toBe("/Admin/users/user%2Fid/avatar/reset");
        expect(config.method).toBe("post");
        expect(config.headers.Authorization).toBe("Bearer admin-token");
        return { config, status: 204, statusText: "", headers: {}, data: "" };
    };
    expect(isSuccessfulResponse(await resetAdminUserAvatarAsync("admin-token", "user/id"))).toBe(true);
});

it.each([true, false])("sets login ban to %s independently from contribution bans", async (isLoginBanned) => {
    csBackend.defaults.adapter = async (config) => {
        expect(config.url).toBe("/Admin/users/user/login-ban");
        expect(config.method).toBe("patch");
        expect(JSON.parse(config.data as string)).toEqual({ isLoginBanned });
        expect(config.headers.Authorization).toBe("Bearer admin-token");
        return { config, status: 200, statusText: "", headers: {}, data: { id: "user", isLoginBanned } };
    };
    const result = await setAdminUserLoginBanAsync("admin-token", "user", isLoginBanned);
    expect(result.response?.isLoginBanned).toBe(isLoginBanned);
});
