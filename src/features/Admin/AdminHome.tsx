"use client";
import { useQuery } from "@tanstack/react-query";
import {
    ChartNoAxesCombined as ChartLineMultiIcon,
    LogIn as LoginIcon,
    Coins as MoneyIcon,
    UserRoundX as UserBlockedIcon,
    Users as UsergroupIcon
} from "lucide-react";
import { Suspense, lazy, useState } from "react";
import { useTranslation } from "react-i18next";

import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip.tsx";
import { Alert, Button, Select, Skeleton } from "../../components/marathon/index.tsx";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import { getDashboardOverviewAsync } from "../../requests/AdminRequests.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import styles from "./AdminHome.module.css";

const DashboardCharts = lazy(() => import("./AdminDashboardCharts.tsx"));

const metricTitles: Record<string, string> = {
    users: "dashboardUsers",
    sponsors: "dashboardSponsors",
    qqVerified: "dashboardQqVerified",
    devices: "dashboardDevices",
    loginAttempts: "dashboardLoginAttempts",
    failedLogins: "dashboardFailedLogins",
    publishedBuilds: "dashboardPublishedBuilds",
    pendingContributions: "dashboardPendingContributions",
    acceptedContributions: "dashboardAcceptedContributions",
    notifications: "dashboardNotifications"
};

const Board = lazy(() => import("../../components/Board.tsx"));

function getDashboardItemIcon(dataKey: string) {
    if (["users", "qqVerified", "devices"].includes(dataKey)) {
        return (
            <div className={styles.iconWrap}>
                <UsergroupIcon className={styles.svgIcon} />
            </div>
        );
    }

    if (dataKey === "sponsors") {
        return (
            <div className={styles.iconWrap}>
                <MoneyIcon className={styles.svgIcon} />
            </div>
        );
    }

    if (dataKey === "loginAttempts") {
        return (
            <div className={styles.iconWrap}>
                <LoginIcon className={styles.svgIcon} />
            </div>
        );
    }

    return (
        <div className={styles.iconWrap}>
            {dataKey === "failedLogins" ? (
                <UserBlockedIcon className={styles.svgIcon} />
            ) : (
                <ChartLineMultiIcon className={styles.svgIcon} />
            )}
        </div>
    );
}

function AdminHome() {
    const { t, i18n } = useTranslation();
    const [days, setDays] = useState(30);
    async function getDashboardDataImplAsync() {
        const authToken = await getStorageItemAsync(StoredAuthToken);

        return getDashboardOverviewAsync(authToken ?? "", days);
    }

    const dashboardItems = useQuery({
        queryKey: ["adminDashboardOverview", days],
        staleTime: 60_000,
        queryFn: () =>
            getDashboardDataImplAsync().then(async (r) => {
                if (!r || !r.status) throw new Error(t("backendServerError"));
                if (!r.response) throw new Error(t("backendServerError"));

                return r.response;
            })
    });

    return (
        <>
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1>{t("dashboardTitle")}</h1>
                        <p>{t("dashboardSubtitle")}</p>
                    </div>
                    <div className={styles.toolbar}>
                        <Select
                            aria-label={t("dashboardLoginTrend")}
                            value={days}
                            onChange={(value) => setDays(Number(value))}
                            options={[7, 30, 90].map((value) => ({
                                value,
                                label: t("dashboardDays", { count: value })
                            }))}
                        />
                        <Button loading={dashboardItems.isFetching} onClick={() => dashboardItems.refetch()}>
                            {t("dashboardRefresh")}
                        </Button>
                    </div>
                </div>
                {dashboardItems.data && (
                    <p className={styles.updated}>
                        {t("dashboardUpdated", {
                            time: new Date(dashboardItems.data.generatedAt).toLocaleString(
                                i18n.language === "zhCN" ? "zh-CN" : "en-US"
                            ),
                            zone: dashboardItems.data.timeZone
                        })}
                    </p>
                )}
                {dashboardItems.error && <Alert theme="error" message={t("backendServerError")} />}

                {dashboardItems.isLoading && <Skeleton theme="paragraph" />}
                <div className={styles.statsGrid}>
                    {!dashboardItems.isLoading &&
                        dashboardItems.data &&
                        dashboardItems.data.metrics.map((boardItem) => (
                            <div key={boardItem.key}>
                                <Suspense fallback={<Skeleton theme="paragraph" />}>
                                    <Board
                                        title={t(metricTitles[boardItem.key] ?? boardItem.key)}
                                        desc={t(
                                            ["loginAttempts", "failedLogins"].includes(boardItem.key)
                                                ? "dashboardPeriod"
                                                : "dashboardAllTime"
                                        )}
                                        count={boardItem.count.toLocaleString()}
                                        Icon={
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span
                                                        tabIndex={0}
                                                        aria-label={t(metricTitles[boardItem.key] ?? boardItem.key)}>
                                                        {getDashboardItemIcon(boardItem.key)}
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent sideOffset={8}>
                                                    {t(metricTitles[boardItem.key] ?? boardItem.key)} ·{" "}
                                                    {t(
                                                        ["loginAttempts", "failedLogins"].includes(boardItem.key)
                                                            ? "dashboardPeriod"
                                                            : "dashboardAllTime"
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                        }
                                    />
                                </Suspense>
                            </div>
                        ))}
                </div>

                {dashboardItems.data && (
                    <Suspense fallback={<Skeleton theme="paragraph" />}>
                        <DashboardCharts data={dashboardItems.data} />
                    </Suspense>
                )}
            </div>
        </>
    );
}

export default AdminHome;
