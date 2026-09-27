import { describe, expect, it } from "vitest";

import { isVerificationCodeExpired } from "./VerificationHelper.ts";

describe("verification code expiry", () => {
    const now = Date.parse("2026-09-27T12:00:00Z");

    it("keeps a code usable before its deadline", () => {
        expect(isVerificationCodeExpired("2026-09-27T12:00:01Z", now)).toBe(false);
        expect(isVerificationCodeExpired("2026-09-27T12:00:01", now)).toBe(false);
        expect(isVerificationCodeExpired("2026-09-27T20:00:01+08:00", now)).toBe(false);
    });

    it("expires a code at its deadline", () => {
        expect(isVerificationCodeExpired("2026-09-27T12:00:00Z", now)).toBe(true);
        expect(isVerificationCodeExpired("2026-09-27T12:00:00", now)).toBe(true);
    });

    it("treats absent or invalid deadlines as expired", () => {
        expect(isVerificationCodeExpired(undefined, now)).toBe(true);
        expect(isVerificationCodeExpired("invalid", now)).toBe(true);
    });
});
