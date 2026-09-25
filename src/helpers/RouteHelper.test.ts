import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSafeRedirect } from "./RouteHelper.ts";

describe("getSafeRedirect", () => {
    beforeEach(() => {
        vi.stubGlobal("window", { location: { origin: "https://corona.studio" } });
    });

    it("keeps internal paths and their query string", () => {
        expect(getSafeRedirect("/user/device?tab=active", "/user")).toBe("/user/device?tab=active");
    });

    it.each([null, "", "https://evil.example", "//evil.example", "javascript:alert(1)"])(
        "rejects unsafe redirect %s",
        (redirect) => {
            expect(getSafeRedirect(redirect, "/user")).toBe("/user");
        }
    );
});
