import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { Suspense, lazy } from "react";
import {
    ChartLineMultiIcon,
    CopyIcon,
    GitRepositoryCommitsIcon,
    LoginIcon,
    MoneyIcon,
    UserBlockedIcon,
    UsergroupIcon
} from "tdesign-icons-react";
import { Alert, Col, Loading, Row, Skeleton } from "tdesign-react";

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
    const quickLinks = [
        {
            text: t("contributorAdminPanel"),
            link: "https://admin.corona.studio/",
            icon: <GitRepositoryCommitsIcon />
        },
        {
            text: "Azure Application Insights",
            link: "https://portal.azure.com/#browse/microsoft.insights%2Fcomponents",
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
            <div>
                {dashboardItems.error && <Alert theme="error" message={t("backendServerError")} />}

                {dashboardItems.isLoading && <Loading />}
                <Row gutter={[12, 12]}>
                    {!dashboardItems.isLoading &&
                        dashboardItems.data &&
                        dashboardItems.data.map((boardItem, i) => (
                            <Col key={i} span={12} sm={12} md={6} lg={3}>
                                <Suspense fallback={<Skeleton theme="paragraph" />}>
                                    <Board
                                        title={boardItem.title}
                                        desc={boardItem.desc}
                                        count={boardItem.count}
                                        Icon={boardItem.icon}
                                    />
                                </Suspense>
                            </Col>
                        ))}
                </Row>

                <div className="mt-8 space-y-4">
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
                                    <a href={link.link} target="_blank">
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
