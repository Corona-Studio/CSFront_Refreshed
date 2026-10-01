// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { Button, Checkbox, Input } from "./controls";
import { Form, type FormController, FormItem } from "./forms";

beforeAll(() =>
    vi.stubGlobal(
        "ResizeObserver",
        class {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
    )
);
afterAll(() => vi.unstubAllGlobals());
afterEach(cleanup);
describe("Marathon forms", () => {
    it("blocks invalid submission and associates the error with its input", async () => {
        const submit = vi.fn();
        const user = userEvent.setup();
        render(
            <Form onSubmit={submit}>
                <FormItem
                    name="email"
                    rules={[
                        { required: true, message: "Email required" },
                        { email: true, message: "Invalid email" }
                    ]}>
                    <Input placeholder="Email" />
                </FormItem>
                <Button type="submit">Submit</Button>
            </Form>
        );
        await user.click(screen.getByRole("button", { name: "Submit" }));
        expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Email required");
        expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe("true");
        expect(submit.mock.calls[0][0].validateResult).not.toBe(true);
        await user.type(screen.getByLabelText("Email"), "runner@example.com");
        await user.click(screen.getByRole("button", { name: "Submit" }));
        await waitFor(() =>
            expect(submit).toHaveBeenLastCalledWith({ validateResult: true, fields: { email: "runner@example.com" } })
        );
    });
    it("checks confirmation against the current password and retains checkbox booleans", async () => {
        const form = createRef<FormController>();
        const submit = vi.fn();
        const user = userEvent.setup();
        render(
            <Form ref={form} onSubmit={submit}>
                <FormItem name="password">
                    <Input placeholder="Password" type="password" />
                </FormItem>
                <FormItem
                    name="confirmation"
                    rules={[
                        {
                            validator: async (value) => value === form.current?.getFieldValue("password"),
                            message: "Mismatch"
                        }
                    ]}>
                    <Input placeholder="Confirm" type="password" />
                </FormItem>
                <FormItem name="remember">
                    <Checkbox>Remember session</Checkbox>
                </FormItem>
                <Button type="submit">Submit</Button>
            </Form>
        );
        await user.type(screen.getByLabelText("Password"), "Sample-password");
        await user.type(screen.getByLabelText("Confirm"), "wrong");
        await user.click(screen.getByRole("button", { name: "Submit" }));
        expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Mismatch");
        await user.clear(screen.getByLabelText("Confirm"));
        await user.type(screen.getByLabelText("Confirm"), "Sample-password");
        await user.click(screen.getByRole("checkbox"));
        await user.click(screen.getByRole("button", { name: "Submit" }));
        await waitFor(() =>
            expect(submit).toHaveBeenLastCalledWith({
                validateResult: true,
                fields: { password: "Sample-password", confirmation: "Sample-password", remember: true }
            })
        );
    });
    it("hydrates an asynchronously restored email without clearing edited fields", async () => {
        const { rerender } = render(
            <Form>
                <FormItem name="email">
                    <Input placeholder="Email" />
                </FormItem>
                <FormItem name="password">
                    <Input placeholder="Password" />
                </FormItem>
            </Form>
        );
        const user = userEvent.setup();
        await user.type(screen.getByLabelText("Password"), "typing");
        rerender(
            <Form>
                <FormItem name="email" initialData="saved@example.com">
                    <Input placeholder="Email" />
                </FormItem>
                <FormItem name="password">
                    <Input placeholder="Password" />
                </FormItem>
            </Form>
        );
        await waitFor(() => expect(screen.getByLabelText("Email")).toHaveProperty("value", "saved@example.com"));
        expect(screen.getByLabelText("Password")).toHaveProperty("value", "typing");
    });
});
