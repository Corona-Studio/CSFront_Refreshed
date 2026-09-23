import { useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import { useMemo, useState } from "react";
import { CheckCircleFilledIcon, CloudIcon, LayersIcon, RefreshIcon, SearchIcon } from "tdesign-icons-react";
import {
    Alert,
    Button,
    Card,
    Input,
    NotificationPlugin,
    PrimaryTable,
    type PrimaryTableCol,
    Space,
    Switch,
    Tag
} from "tdesign-react";

import Constants from "../../helpers/Constants.ts";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import {
    type AdminBuildInfo,
    getAdminBuildsAsync,
    refreshBuildCacheAsync,
    setBuildHotFixAsync
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

    async function setHotFixAsync(build: AdminBuildInfo, isHotFix: boolean) {
        setUpdatingBuildIds((ids) => new Set(ids).add(build.id));

        try {
            const response = await setBuildHotFixAsync(await getAdminTokenAsync(), build, isHotFix);

            if (response?.status === 404) {
                await buildsQuery.refetch();
                throw new Error(t("buildNoLongerExists"));
            }

            if (!response || response.status !== 200 || !response.response)
                throw new Error(t("buildUpdateFailedDescription"));

            queryClient.setQueryData<AdminBuildInfo[]>(queryKey, (builds) =>
                builds?.map((item) => (item.id === build.id ? response.response! : item))
            );

            await NotificationPlugin.success({
                title: t("buildUpdateSucceeded"),
                content: isHotFix ? t("buildEnabledDescription") : t("buildDisabledDescription"),
                placement: "top-right",
                duration: 3000,
                offset: Constants.NotificationOffset,
                closeBtn: true,
                attach: () => document
            });
        } catch (error) {
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
    }

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

    const buildStats = useMemo(
        () => ({
            total: buildsQuery.data?.length ?? 0,
            enabled: buildsQuery.data?.filter((build) => build.isHotFix).length ?? 0,
            cached: buildsQuery.data?.filter((build) => build.isCached).length ?? 0
        }),
        [buildsQuery.data]
    );

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
                            <Tag size="small" variant="light-outline" theme={row.channel === 0 ? "primary" : "warning"}>
                                {t(row.channel === 0 ? "stable" : "preview")}
                            </Tag>
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
                        <span className={styles.targetSeparator}>/</span>
                        <code>{row.runtime}</code>
                    </div>
                )
            },
            {
                colKey: "status",
                title: t("buildStatus"),
                width: 240,
                cell: ({ row }) => (
                    <Space size="small" breakLine>
                        <Tag
                            size="small"
                            variant="light"
                            theme={row.isApproved ? "success" : row.isReviewed ? "danger" : "warning"}>
                            {t(row.isApproved ? "buildApproved" : row.isReviewed ? "buildRejected" : "buildUnreviewed")}
                        </Tag>
                        <Tag size="small" theme={row.isCached ? "success" : "default"} variant="light">
                            {t(row.isCached ? "buildCached" : "buildNotCached")}
                        </Tag>
                    </Space>
                )
            },
            {
                colKey: "isHotFix",
                title: t("pushToUsers"),
                width: 128,
                fixed: "right",
                cell: ({ row }) => (
                    <div className={styles.pushControl}>
                        <Switch
                            size="small"
                            value={row.isHotFix}
                            loading={updatingBuildIds.has(row.id)}
                            disabled={updatingBuildIds.has(row.id)}
                            onChange={(value) => setHotFixAsync(row, Boolean(value))}
                        />
                        <span className={row.isHotFix ? styles.enabledText : styles.disabledText}>
                            {t(row.isHotFix ? "enabled" : "disabled")}
                        </span>
                    </div>
                )
            }
        ],
        [updatingBuildIds]
    );

    return (
        <Space direction="vertical" size="large" className={styles.page}>
            <Alert className={styles.notice} theme="warning" message={t("buildManagementDescription")} />
            {buildsQuery.error && <Alert theme="error" message={t("backendServerError")} />}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>
                        <LayersIcon />
                    </span>
                    <div>
                        <strong>{buildStats.total}</strong>
                        <span>{t("allBuilds")}</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <span className={`${styles.statIcon} ${styles.enabledIcon}`}>
                        <CheckCircleFilledIcon />
                    </span>
                    <div>
                        <strong>{buildStats.enabled}</strong>
                        <span>{t("pushEnabledBuilds")}</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <span className={`${styles.statIcon} ${styles.cachedIcon}`}>
                        <CloudIcon />
                    </span>
                    <div>
                        <strong>{buildStats.cached}</strong>
                        <span>{t("cachedBuilds")}</span>
                    </div>
                </div>
            </div>
            <Card className={styles.listCard}>
                <div className={styles.toolbar}>
                    <div>
                        <h3>{t("allBuilds")}</h3>
                        <p>{t("buildCount", { count: filteredBuilds.length })}</p>
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
                            theme="primary"
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
                    stripe
                    loading={buildsQuery.isLoading}
                    data={filteredBuilds}
                    columns={columns}
                    maxHeight="clamp(320px, calc(100vh - 430px), 620px)"
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
