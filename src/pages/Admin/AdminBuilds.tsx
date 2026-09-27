import { useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import { useCallback, useMemo, useState } from "react";
import { RefreshIcon, SearchIcon } from "tdesign-icons-react";
import {
    Alert,
    Button,
    Card,
    Input,
    NotificationPlugin,
    PrimaryTable,
    type PrimaryTableCol,
    Space
} from "tdesign-react";

import Constants from "../../helpers/Constants.ts";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import {
    type AdminBuildInfo,
    getAdminBuildsAsync,
    refreshBuildCacheAsync,
    setBuildPublishedAsync
} from "../../requests/AdminRequests.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import styles from "./AdminBuilds.module.css";

const queryKey = ["adminBuilds"];

async function getAdminTokenAsync() {
    return (await getStorageItemAsync(StoredAuthToken)) ?? "";
}

function AdminBuilds() {
    const queryClient = useQueryClient();
    const [updatingBuildIds, setUpdatingBuildIds] = useState<Set<string>>(new Set());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 15 });

    const buildsQuery = useQuery({
        queryKey,
        queryFn: async () => {
            const response = await getAdminBuildsAsync(await getAdminTokenAsync());

            if (!response || response.status !== 200 || !response.response) throw new Error(t("backendServerError"));

            return response.response;
        }
    });

    const refetchBuilds = buildsQuery.refetch;

    const setPublishedAsync = useCallback(
        async (build: AdminBuildInfo, isPublished: boolean) => {
            setUpdatingBuildIds((ids) => new Set(ids).add(build.id));

            try {
                const response = await setBuildPublishedAsync(await getAdminTokenAsync(), build, isPublished);

                if (response?.status === 404) {
                    await refetchBuilds();
                    throw new Error(t("buildNoLongerExists"));
                }

                if (!response || response.status !== 200 || !response.response)
                    throw new Error(t("buildUpdateFailedDescription"));

                queryClient.setQueryData<AdminBuildInfo[]>(queryKey, (builds) =>
                    builds?.map((item) => (item.id === build.id ? response.response! : item))
                );

                await NotificationPlugin.success({
                    title: t("buildUpdateSucceeded"),
                    content: isPublished ? t("buildEnabledDescription") : t("buildDisabledDescription"),
                    placement: "top-right",
                    duration: 3000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });
            } catch (error) {
                await refetchBuilds();
                await NotificationPlugin.error({
                    title: t("buildUpdateFailed"),
                    content: (error as Error).message,
                    placement: "top-right",
                    duration: 3000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });
            } finally {
                setUpdatingBuildIds((ids) => {
                    const nextIds = new Set(ids);
                    nextIds.delete(build.id);
                    return nextIds;
                });
            }
        },
        [queryClient, refetchBuilds]
    );

    async function refreshCacheAsync() {
        setIsRefreshing(true);

        try {
            const response = await refreshBuildCacheAsync(await getAdminTokenAsync());

            if (!response || response.status !== 200 || !response.response)
                throw new Error(t("buildCacheRefreshFailedDescription"));

            await buildsQuery.refetch();
            await NotificationPlugin.success({
                title: t("buildCacheRefreshSucceeded"),
                content: t("buildCacheRefreshSucceededDescription", { count: response.response.buildCount }),
                placement: "top-right",
                duration: 3000,
                offset: Constants.NotificationOffset,
                closeBtn: true,
                attach: () => document
            });
        } catch (error) {
            await NotificationPlugin.error({
                title: t("buildCacheRefreshFailed"),
                content: (error as Error).message,
                placement: "top-right",
                duration: 3000,
                offset: Constants.NotificationOffset,
                closeBtn: true,
                attach: () => document
            });
        } finally {
            setIsRefreshing(false);
        }
    }

    const filteredBuilds = useMemo(() => {
        const keyword = searchText.trim().toLocaleLowerCase();
        if (!keyword) return buildsQuery.data ?? [];

        return (buildsQuery.data ?? []).filter((build) =>
            [build.id, build.branch, build.framework, build.runtime, build.releaseNote]
                .join(" ")
                .toLocaleLowerCase()
                .includes(keyword)
        );
    }, [buildsQuery.data, searchText]);

    const columns = useMemo<PrimaryTableCol<AdminBuildInfo>[]>(
        () => [
            {
                colKey: "build",
                title: t("buildInfo"),
                width: 260,
                cell: ({ row }) => (
                    <div className={styles.buildInfo}>
                        <div className={styles.buildTitle}>
                            <span>{row.branch}</span>
                            <span className={styles.channel}>{t(row.channel === 0 ? "stable" : "preview")}</span>
                        </div>
                        <span className={styles.secondaryText}>{new Date(row.releaseDate).toLocaleString()}</span>
                    </div>
                )
            },
            {
                colKey: "target",
                title: t("buildTarget"),
                width: 240,
                cell: ({ row }) => (
                    <div className={styles.targetInfo}>
                        <code>{row.framework}</code>
                        <span className={styles.targetSeparator}>·</span>
                        <code>{row.runtime}</code>
                    </div>
                )
            },
            {
                colKey: "isPublished",
                title: t("pushToUsers"),
                width: 128,
                fixed: "right",
                cell: ({ row }) => (
                    <div className={styles.pushControl}>
                        <button
                            type="button"
                            role="switch"
                            aria-label={t("pushToUsers")}
                            aria-checked={row.isPublished}
                            className={`${styles.deliverySwitch} ${row.isPublished ? styles.deliverySwitchEnabled : ""} ${updatingBuildIds.has(row.id) ? styles.deliverySwitchLoading : ""}`}
                            disabled={updatingBuildIds.has(row.id)}
                            onClick={() => setPublishedAsync(row, !row.isPublished)}>
                            <span className={styles.deliverySwitchThumb} />
                        </button>
                        <span className={row.isPublished ? styles.enabledText : styles.disabledText}>
                            {t(row.isPublished ? "enabled" : "disabled")}
                        </span>
                    </div>
                )
            }
        ],
        [setPublishedAsync, updatingBuildIds]
    );

    return (
        <Space direction="vertical" size="large" className={styles.page}>
            {buildsQuery.error && <Alert theme="error" message={t("backendServerError")} />}
            <Card className={styles.listCard}>
                <div className={styles.toolbar}>
                    <div>
                        <h3>{t("allBuilds")}</h3>
                        <p>
                            {t("buildCount", { count: filteredBuilds.length })} · {t("buildManagementDescription")}
                        </p>
                    </div>
                    <div className={styles.toolbarActions}>
                        <Input
                            className={styles.searchInput}
                            value={searchText}
                            clearable
                            prefixIcon={<SearchIcon />}
                            placeholder={t("searchBuilds")}
                            onChange={(value) => {
                                setSearchText(value);
                                setPagination((current) => ({ ...current, current: 1 }));
                            }}
                        />
                        <Button
                            className={styles.refreshButton}
                            theme="default"
                            variant="outline"
                            icon={<RefreshIcon />}
                            loading={isRefreshing}
                            onClick={refreshCacheAsync}>
                            {t("refreshBuildCacheNow")}
                        </Button>
                    </div>
                </div>
                <PrimaryTable<AdminBuildInfo>
                    className={styles.buildTable}
                    rowKey="id"
                    hover
                    loading={buildsQuery.isLoading}
                    data={filteredBuilds}
                    columns={columns}
                    tableLayout="fixed"
                    empty={t("noMatchingBuilds")}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: filteredBuilds.length,
                        pageSizeOptions: [10, 15, 20, 50],
                        showPageSize: true,
                        showJumper: true,
                        onChange: ({ current, pageSize }) => setPagination({ current, pageSize })
                    }}
                />
            </Card>
        </Space>
    );
}

export const Component = () => AdminBuilds();
