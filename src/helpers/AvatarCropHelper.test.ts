import { describe, expect, it } from "vitest";

import { getAvatarCrop } from "./AvatarCropHelper.ts";

describe("square avatar cropping", () => {
    it.each([
        [1600, 900, 350, 0],
        [900, 1600, 0, 350]
    ])("centers a rectangular image %s × %s", (width, height, x, y) => {
        expect(getAvatarCrop(width, height, 1, { x: 0.5, y: 0.5 })).toMatchObject({ x, y, size: 900 });
    });

    it("keeps a zoomed crop within the image at both drag extremes", () => {
        expect(getAvatarCrop(1600, 900, 3, { x: -10, y: -10 })).toMatchObject({ x: 0, y: 0, size: 300 });
        expect(getAvatarCrop(1600, 900, 3, { x: 10, y: 10 })).toMatchObject({ x: 1300, y: 600, size: 300 });
    });

    it("retains the displayed center when a crop hits an edge and zoom changes", () => {
        const first = getAvatarCrop(1600, 900, 1, { x: 0, y: 1 });
        const zoomed = getAvatarCrop(1600, 900, 2, first.center);
        expect(zoomed.center).toEqual(first.center);
        expect(zoomed.size).toBe(450);
    });
});
