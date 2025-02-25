import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import {
    ChartLineMultiIcon,
    GitRepositoryCommitsIcon,
    LoginIcon,
    MoneyIcon,
    UserBlockedIcon,
    UsergroupIcon
} from "tdesign-icons-react";
import { Alert, Col, Loading, Row } from "tdesign-react";

import Board from "../../components/Board.tsx";
import { getStorageItem } from "../../helpers/StorageHelper.ts";
import { getDashboardData } from "../../requests/AdminRequests.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import styles from "./AdminHome.module.css";

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
    const authToken = getStorageItem(StoredAuthToken);

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

    const dashboardItems = useQuery({
        queryKey: ["dashboardItems"],
        queryFn: () =>
            getDashboardData(authToken ?? "").then(async (r) => {
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

    return (
        <>
            <div>
                {dashboardItems.isLoading && <Loading />}

                {dashboardItems.error && <Alert theme="error" message={t("backendServerError")} />}

                <Row gutter={[12, 12]}>
                    {!dashboardItems.isLoading &&
                        dashboardItems.data &&
                        dashboardItems.data.map((boardItem, i) => (
                            <Col key={i} span={12} sm={12} md={6} lg={3}>
                                <Board
                                    title={boardItem.title}
                                    desc={boardItem.desc}
                                    count={boardItem.count}
                                    Icon={boardItem.icon}></Board>
                            </Col>
                        ))}
                </Row>

                <div className="mt-8 space-y-4">
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
