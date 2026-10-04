// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "../../components/ui/tooltip.tsx";
import type { AdminDashboardOverview } from "../../requests/AdminRequests.ts";
import AdminDashboardCharts from "./AdminDashboardCharts.tsx";

vi.mock("react-i18next", async (importOriginal) => ({
    ...(await importOriginal<typeof import("react-i18next")>()),
    useTranslation: () => ({ t: (key: string) => key })
}));
vi.mock("@visx/responsive", () => ({
    ParentSize: ({ children }: { children: (size: { width: number }) => ReactNode }) => children({ width: 600 })
}));

const overview: AdminDashboardOverview = {
    generatedAt: "2026-10-04T12:00:00+08:00",
    timeZone: "Asia/Shanghai",
    days: 7,
    metrics: [
        { key: "users", count: 10 },
        { key: "qqVerified", count: 6 },
        { key: "publishedBuilds", count: 3 }
    ],
    loginTrend: [{ date: "2026-10-04", succeeded: 8, failed: 2 }],
    accountDistribution: [
        { key: "sponsors", count: 2 },
        { key: "regularUsers", count: 8 }
    ],
    buildRuntimes: [{ key: "win-x64", count: 5 }],
    pendingContributions: [{ key: "translations", count: 4 }],
    loginHours: [{ hour: 9, succeeded: 8, failed: 2 }],
    acceptedContributionTrend: [{ date: "2026-10-04", count: 3 }]
};

function renderCharts(data = overview) {
    return render(
        <TooltipProvider>
            <AdminDashboardCharts data={data} />
        </TooltipProvider>
    );
}
beforeEach(() => {
    vi.stubGlobal(
        "ResizeObserver",
        class {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
    );
});
afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("admin dashboard charts", () => {
    it.each([
        ["2026-10-04 dashboardSucceeded: 8", "2026-10-04 · dashboardSucceeded: 8 · dashboardFailed: 2"],
        ["win-x64: 5", "win-x64: 5"],
        ["dashboardSponsors: 2", "dashboardSponsors: 2 (20.0%)"],
        ["09:00 dashboardSucceeded: 8", "09:00 · dashboardSucceeded: 8 · dashboardFailed: 2"],
        ["2026-10-04 dashboardAcceptedContributions: 3", "2026-10-04 · dashboardAcceptedContributions: 3"]
    ])("shows exact values for %s on focus and dismisses with Escape", async (label, content) => {
        renderCharts();
        fireEvent.focus(screen.getByLabelText(label));
        expect((await screen.findByRole("tooltip")).textContent).toContain(content);
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

    it("exposes derived distributions and both new timelines", () => {
        renderCharts();
        expect(screen.getByLabelText("dashboardUnverified: 4")).toBeTruthy();
        expect(screen.getByLabelText("dashboardUnpublished: 2")).toBeTruthy();
        expect(screen.getByLabelText("09:00 dashboardSucceeded: 8")).toBeTruthy();
        expect(screen.getByLabelText("2026-10-04 dashboardAcceptedContributions: 3")).toBeTruthy();
    });

    it("supports a backend that has not yet returned the new fields and empty totals", () => {
        renderCharts({
            ...overview,
            metrics: [],
            accountDistribution: [],
            buildRuntimes: [],
            pendingContributions: [],
            loginHours: undefined,
            acceptedContributionTrend: undefined
        });
        expect(screen.queryByRole("img", { name: "dashboardLoginHours" })).toBeNull();
        expect(screen.queryByRole("img", { name: "dashboardContributionTrend" })).toBeNull();
        expect(screen.getAllByText("dashboardNoData").length).toBeGreaterThan(0);
    });
});
