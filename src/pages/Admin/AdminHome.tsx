import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { Suspense, lazy } from "react";
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
import { Alert, Loading, Skeleton } from "tdesign-react";

import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import { getDashboardDataAsync } from "../../requests/AdminRequests.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import styles from "./AdminHome.module.css";

const Board = lazy(() => import("../../components/Board.tsx"));

function getDashboardItemIcon(dataKey: string) {
    if (dataKey === "UserCount") {
        return (
            <div className={styles.iconWrap}>
                <UsergroupIcon className={styles.svgIcon} />
            </div>
        );
    }

    if (dataKey === "InsiderCount") {
        return (
            <div className={styles.iconWrap}>
                <MoneyIcon className={styles.svgIcon} />
            </div>
        );
    }

    if (dataKey === "LoginCount") {
        return (
            <div className={styles.iconWrap}>
                <LoginIcon className={styles.svgIcon} />
            </div>
        );
    }

    return (
        <div className={styles.iconWrap}>
            <UserBlockedIcon className={styles.svgIcon} />
        </div>
    );
}

function AdminHome() {
    const navigate = useNavigate();
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

        return getDashboardDataAsync(authToken ?? "");
    }

    const dashboardItems = useQuery({
        queryKey: ["dashboardItems"],
        queryFn: () =>
            getDashboardDataImplAsync().then(async (r) => {
                if (!r || !r.status) throw new Error(t("backendServerError"));
                if (!r.response) throw new Error(t("backendServerError"));

                return r.response.map((data) => ({
                    title: t(data.dataTitleKey),
                    desc: t(data.dataDescKey),
                    count: data.count,
                    icon: getDashboardItemIcon(data.type)
                }));
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
                {dashboardItems.error && <Alert theme="error" message={t("backendServerError")} />}

                {dashboardItems.isLoading && <Loading />}
                <div className={styles.statsGrid}>
                    {!dashboardItems.isLoading &&
                        dashboardItems.data &&
                        dashboardItems.data.map((boardItem, i) => (
                            <div key={i}>
                                <Suspense fallback={<Skeleton theme="paragraph" />}>
                                    <Board
                                        title={boardItem.title}
                                        desc={boardItem.desc}
                                        count={boardItem.count}
                                        Icon={boardItem.icon}
                                    />
                                </Suspense>
                            </div>
                        ))}
                </div>

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
