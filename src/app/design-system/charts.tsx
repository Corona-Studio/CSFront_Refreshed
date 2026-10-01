"use client";

import AdminDashboardCharts from "@/features/Admin/AdminDashboardCharts";
import type { AdminDashboardOverview } from "@/requests/AdminRequests";

const preview: AdminDashboardOverview = {
    generatedAt: "2026-10-01T00:00:00Z",
    timeZone: "Asia/Shanghai",
    days: 7,
    metrics: [],
    loginTrend: [
        { date: "2026-09-24", succeeded: 96, failed: 12 },
        { date: "2026-09-25", succeeded: 124, failed: 18 },
        { date: "2026-09-26", succeeded: 112, failed: 9 },
        { date: "2026-09-27", succeeded: 158, failed: 24 },
        { date: "2026-09-28", succeeded: 146, failed: 16 },
        { date: "2026-09-29", succeeded: 182, failed: 22 },
        { date: "2026-09-30", succeeded: 176, failed: 14 }
    ],
    accountDistribution: [{ key: "regular", count: 840 }, { key: "sponsors", count: 160 }],
    buildRuntimes: [{ key: "Windows", count: 42 }, { key: "macOS", count: 28 }, { key: "Linux", count: 19 }],
    pendingContributions: [{ key: "translations", count: 12 }, { key: "links", count: 8 }, { key: "tags", count: 5 }]
};

export default function ChartPreview() {
    return <AdminDashboardCharts data={preview} />;
}
