import { describe, expect, it } from "vitest";

import { toPlainText } from "./utils";

describe("plain text for generic form and table values", () => {
    it.each([
        ["hello", "hello"],
        [0, "0"],
        [false, "false"],
        [42n, "42"],
        [null, ""],
        [undefined, ""]
    ])("formats %s as %s", (value, expected) => {
        expect(toPlainText(value)).toBe(expected);
    });

    it("leaves complex values to explicit renderers without invoking custom string coercion", () => {
        expect(
            toPlainText({
                toString: () => {
                    throw new Error("unexpected coercion");
                }
            })
        ).toBe("");
        expect(toPlainText(["one", "two"])).toBe("");
    });
});
