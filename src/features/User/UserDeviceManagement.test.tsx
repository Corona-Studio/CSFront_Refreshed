// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getStorageItemAsync } from "../../helpers/StorageHelper";
import { getUserAllDevicesAsync, removeDeviceAsync } from "../../requests/LxUserRequests";
import { Component } from "./UserDeviceManagement";

vi.mock("react-i18next", async (importOriginal) => ({
    ...(await importOriginal<typeof import("react-i18next")>()),
    useTranslation: () => ({ t: (key: string) => key })
}));
vi.mock("../../helpers/StorageHelper", () => ({ getStorageItemAsync: vi.fn() }));
vi.mock("../../requests/LxUserRequests", () => ({
    getUserAllDevicesAsync: vi.fn(),
    removeDeviceAsync: vi.fn()
}));

const device = {
    id: "a0a92e90-219e-4bce-b7c8-5d71f4ff02c4",
    computerName: "LAOLAROU-PC",
    mac: "2F74B88545FE43579C91638D3080F3F4FAED",
    userId: "user",
    processorId: "cpu",
    bios: "bios"
};

function renderPage() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
        <QueryClientProvider client={client}>
            <Component />
        </QueryClientProvider>
    );
    return client;
}

beforeEach(() => {
    vi.mocked(getStorageItemAsync).mockResolvedValue("token");
    vi.mocked(getUserAllDevicesAsync).mockResolvedValue({ status: 200, response: [device] });
    vi.mocked(removeDeviceAsync).mockResolvedValue({ status: 200, response: "ok" });
});
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe("device management", () => {
    it("copies the complete identifier", async () => {
        const user = userEvent.setup();
        const copy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
        const client = renderPage();
        await screen.findByText(device.computerName);
        expect(screen.getByText(device.id)).toBeTruthy();
        expect(screen.getByText(device.mac)).toBeTruthy();
        await user.click(screen.getByRole("button", { name: `copy deviceId: ${device.computerName}` }));
        expect(copy).toHaveBeenCalledWith(device.id);
        client.clear();
    });

    it("requires confirmation before removing the selected device and refreshes afterward", async () => {
        const user = userEvent.setup();
        const client = renderPage();
        await screen.findByText(device.computerName);
        await user.click(screen.getByRole("button", { name: `removeDevice: ${device.computerName}` }));
        const dialog = screen.getByRole("dialog", { name: "confirmRemoveDevice" });
        expect(within(dialog).getByText(device.computerName)).toBeTruthy();
        expect(removeDeviceAsync).not.toHaveBeenCalled();
        await user.click(within(dialog).getByRole("button", { name: "removeDevice" }));
        await waitFor(() => expect(removeDeviceAsync).toHaveBeenCalledWith(device, "token"));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(getUserAllDevicesAsync).toHaveBeenCalledTimes(2);
        client.clear();
    });

    it("shows the fetch error without a misleading empty state", async () => {
        vi.mocked(getUserAllDevicesAsync).mockRejectedValue(new Error("Unable to fetch devices"));
        const client = renderPage();
        await screen.findByText("Unable to fetch devices");
        expect(screen.queryByText("noRegisteredDevices")).toBeNull();
        client.clear();
    });
});
