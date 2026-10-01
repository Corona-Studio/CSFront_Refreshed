"use client";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Alert, Button, Card, Empty, Loading } from "../../components/marathon/index.tsx";
import { getLauncherNotificationsAsync } from "../../requests/LxNotificationRequests.ts";
import styles from "./UserNotifications.module.css";

function UserNotifications() {
    const { t, i18n } = useTranslation();
    const notifications = useQuery({
        queryKey: ["launcherNotifications"],
        queryFn: getLauncherNotificationsAsync,
        staleTime: 60_000,
        retry: false
    });

    return (
        <Card title={t("launcherNotifications")} bordered headerBordered>
            {notifications.isPending ? (
                <div className={styles.loading}>
                    <Loading />
                </div>
            ) : notifications.isError ? (
                <Alert
                    theme="error"
                    title={t("notificationListLoadFailed")}
                    message={t("launcherNotificationsLoadFailed")}
                    operation={
                        <Button loading={notifications.isFetching} onClick={() => notifications.refetch()}>
                            {t("retry")}
                        </Button>
                    }
                />
            ) : notifications.data.length === 0 ? (
                <Empty description={t("noNotifications")} />
            ) : (
                <div className={styles.list}>
                    {notifications.data.map((notification) => (
                        <article key={notification.id} className={styles.notification}>
                            <h3 className={styles.title}>{notification.title}</h3>
                            <div className={styles.metadata}>
                                <span>
                                    {t("notificationAuthor")}: {notification.author}
                                </span>
                                <time dateTime={notification.publishDate}>
                                    {new Date(notification.publishDate).toLocaleString(
                                        i18n.resolvedLanguage === "enUS" ? "en-US" : "zh-CN"
                                    )}
                                </time>
                            </div>
                            <p className={styles.content}>{notification.content}</p>
                        </article>
                    ))}
                </div>
            )}
        </Card>
    );
}

export default UserNotifications;
