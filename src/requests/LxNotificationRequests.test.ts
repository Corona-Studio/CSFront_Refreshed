import { afterEach, describe, expect, it } from "vitest";

import { csBackend } from "./ApiConstants.ts";
import { type LauncherNotification, getLauncherNotificationsAsync } from "./LxNotificationRequests.ts";

const originalAdapter = csBackend.defaults.adapter;
afterEach(() => {
    csBackend.defaults.adapter = originalAdapter;
});

function notification(id: string, author: string, title = "Launcher update"): LauncherNotification {
    return { id, author, title, content: "Update details", publishDate: "2026-09-30T08:00:00Z" };
}

describe("launcher notifications", () => {
    it("filters the author suffix, preserving normal notifications and their order", async () => {
        const publicNotifications = [
            notification("1", "Corona", "Title_CONNECTX_ADM"),
            notification("4", "Corona_CONNECTX_ADM_team")
        ];
        csBackend.defaults.adapter = async (config) => {
            expect(config.url).toBe("/Notification");
            expect(config.params).toEqual({ limit: 20 });
            expect(config.headers.Authorization).toBeUndefined();
            return {
                config,
                status: 200,
                statusText: "OK",
                headers: {},
                data: [
                    publicNotifications[0],
                    notification("2", "1_CONNECTX_ADM"),
                    notification("3", "0_CONNECTX_ADM"),
                    publicNotifications[1]
                ]
            };
        };

        expect(await getLauncherNotificationsAsync()).toEqual(publicNotifications);
    });

    it("returns an empty list when every notification is filtered", async () => {
        csBackend.defaults.adapter = async (config) => ({
            config,
            status: 200,
            statusText: "OK",
            headers: {},
            data: [notification("1", "1_CONNECTX_ADM")]
        });
        expect(await getLauncherNotificationsAsync()).toEqual([]);
    });

    it.each([
        [500, []],
        [200, {}],
        [200, undefined]
    ])("rejects unsuccessful or invalid responses (%s, %s)", async (status, data) => {
        csBackend.defaults.adapter = async (config) => ({
            config,
            status: status as number,
            statusText: "",
            headers: {},
            data
        });
        await expect(getLauncherNotificationsAsync()).rejects.toThrow("Failed to load launcher notifications");
    });
});
