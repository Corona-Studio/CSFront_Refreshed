import { useQuery } from "@tanstack/react-query";
import { Suspense, lazy, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import {
    ChartLineMultiIcon,
    CopyIcon,
    GitRepositoryCommitsIcon,
    LoginIcon,
    MoneyIcon,
    UserBlockedIcon,
    UsergroupIcon
} from "tdesign-icons-react";
import { Alert, Button, Select, Skeleton } from "tdesign-react";

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
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [days, setDays] = useState(30);
    const quickLinks = [
        {
            text: t("contributorAdminPanel"),
            link: "/admin/contributions",
            external: false,
            icon: <GitRepositoryCommitsIcon />
        },
        {
            text: "Azure Application Insights",
            link: "https://portal.azure.com/#browse/microsoft.insights%2Fcomponents",
            external: true,
            icon: <ChartLineMultiIcon />
        }
    ];

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

    function copyAdminUserTokenAsync() {
        getStorageItemAsync(StoredAuthToken).then((value) => {
            navigator.clipboard.writeText(value ?? "").then();
        });
    }

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
                                        Icon={getDashboardItemIcon(boardItem.key)}
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
                <div className={styles.links}>
                    <div>
                        <Alert
                            icon={<CopyIcon />}
                            theme="success"
                            message={t("copyAdminUserToken")}
                            operation={
                                <a onClick={copyAdminUserTokenAsync} target="_blank">
                                    {t("copy")}
                                </a>
                            }
                        />
                    </div>

                    {quickLinks.map((link, i) => (
                        <div key={i}>
                            <Alert
                                icon={link.icon}
                                theme="info"
                                message={link.text}
                                operation={
                                    <a
                                        href={link.link}
                                        target={link.external ? "_blank" : undefined}
                                        rel={link.external ? "noopener noreferrer" : undefined}
                                        onClick={(event) => {
                                            if (link.external) return;
                                            event.preventDefault();
                                            navigate(link.link);
                                        }}>
                                        {t("checkHere")}
                                    </a>
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default AdminHome;
