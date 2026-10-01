// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button, Dialog } from "./controls";

afterEach(cleanup);
describe("Marathon confirmation", () => {
    it("prevents duplicate actions through a loading button", async () => {
        const clicked = vi.fn();
        const user = userEvent.setup();
        render(
            <Button loading onClick={clicked}>
                Save
            </Button>
        );
        await user.click(screen.getByRole("button", { name: "Save" }));
        expect(clicked).not.toHaveBeenCalled();
        expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("true");
    });
    it("does not close on Escape while a mutation is in flight", async () => {
        const close = vi.fn();
        const user = userEvent.setup();
        render(
            <Dialog visible header="Delete record" confirmLoading onClose={close}>
                <p>Wait for completion</p>
            </Dialog>
        );
        expect(screen.getByRole("dialog", { name: "Delete record" })).toBeTruthy();
        await user.keyboard("{Escape}");
        expect(close).not.toHaveBeenCalled();
    });
    it("supports keyboard cancellation when idle", async () => {
        const close = vi.fn();
        const user = userEvent.setup();
        render(
            <Dialog visible header="Confirm change" onClose={close}>
                <p>Review this change</p>
            </Dialog>
        );
        await user.keyboard("{Escape}");
        expect(close).toHaveBeenCalledOnce();
    });
});
