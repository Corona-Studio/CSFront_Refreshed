import { afterEach, expect, it } from "vitest";

import { csBackend, isSuccessfulResponse } from "./ApiConstants.ts";
import { uploadUserAvatarAsync } from "./LxUserRequests.ts";

const originalAdapter = csBackend.defaults.adapter;
afterEach(() => {
    csBackend.defaults.adapter = originalAdapter;
});

it("uploads the square PNG with the expected multipart field and bearer token, accepting an empty body", async () => {
    csBackend.defaults.adapter = async (config) => {
        expect(config.url).toBe("/Avatar/upload");
        expect(config.method).toBe("post");
        expect(config.headers.Authorization).toBe("Bearer token");
        expect(config.data).toBeInstanceOf(FormData);
        const file = (config.data as FormData).get("file") as File;
        expect(file.name).toBe("avatar.png");
        expect(file.type).toBe("image/png");
        return { config, status: 200, statusText: "OK", headers: {}, data: "" };
    };
    expect(isSuccessfulResponse(await uploadUserAvatarAsync(new Blob(["png"], { type: "image/png" }), "token"))).toBe(
        true
    );
});
