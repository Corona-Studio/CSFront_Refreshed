import { afterEach, describe, expect, it } from "vitest";

import {
    acceptContributionAsync,
    createAdminNotificationAsync,
    deleteAdminNotificationAsync,
    deleteContributionItemAsync
} from "./AdminRequests.ts";
import { csBackend, isSuccessfulResponse } from "./ApiConstants.ts";
import { removeDeviceAsync } from "./LxUserRequests.ts";

const originalAdapter = csBackend.defaults.adapter;
afterEach(() => {
    csBackend.defaults.adapter = originalAdapter;
});

describe("mutation HTTP responses", () => {
    it("accepts notification creation with 201 and deletion with an empty 204 body", async () => {
        csBackend.defaults.adapter = async (config) => ({
            config,
            status: config.method === "post" ? 201 : 204,
            statusText: "",
            headers: {},
            data: config.method === "post" ? { id: "notification" } : ""
        });
        const created = await createAdminNotificationAsync("token", {
            title: "title",
            content: "content",
            author: "author"
        });
        expect(isSuccessfulResponse(created)).toBe(true);
        expect(created?.response).toEqual({ id: "notification" });
        const deleted = await deleteAdminNotificationAsync("token", "notification");
        expect(deleted?.status).toBe(204);
        expect(isSuccessfulResponse(deleted)).toBe(true);
        expect(isSuccessfulResponse(await deleteContributionItemAsync("token", "tag", "contribution"))).toBe(true);
        expect(
            isSuccessfulResponse(
                await acceptContributionAsync("token", "resource", { translatedName: "translated", tags: [] })
            )
        ).toBe(true);
    });

    it.each([0, 400, 401, 403, 404, 409, 500])(
        "rejects device deletion failure %s even with a success-shaped body",
        async (status) => {
            csBackend.defaults.adapter = async (config) => ({
                config,
                status,
                statusText: "",
                headers: {},
                data: "succeeded"
            });
            const response = await removeDeviceAsync(
                {
                    id: "device",
                    userId: "user",
                    computerName: "computer",
                    processorId: "cpu",
                    bios: "bios",
                    mac: "mac"
                },
                "token"
            );
            expect(isSuccessfulResponse(response)).toBe(false);
        }
    );
});
