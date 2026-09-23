import { useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import { useMemo, useState } from "react";
import { RefreshIcon } from "tdesign-icons-react";
import {
    Alert,
    Button,
    Card,
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

const queryKey = ["adminBuilds"];

async function getAdminTokenAsync() {
    return (await getStorageItemAsync(StoredAuthToken)) ?? "";
}

function AdminBuilds() {
    const queryClient = useQueryClient();
    const [updatingBuildIds, setUpdatingBuildIds] = useState<Set<string>>(new Set());
    const [isRefreshing, setIsRefreshing] = useState(false);

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
            const response = await setBuildHotFixAsync(await getAdminTokenAsync(), build.id, isHotFix);

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

    const columns = useMemo<PrimaryTableCol<AdminBuildInfo>[]>(
        () => [
            {
                colKey: "releaseDate",
                title: t("releaseDate"),
                width: 180,
                cell: ({ row }) => new Date(row.releaseDate).toLocaleString()
            },
            { colKey: "branch", title: t("buildBranch"), width: 110 },
            {
                colKey: "channel",
                title: t("buildChannel"),
                width: 110,
                cell: ({ row }) => t(row.channel === 0 ? "stable" : "preview")
            },
            { colKey: "framework", title: t("buildFramework"), width: 180 },
            { colKey: "runtime", title: t("buildRuntime"), width: 130 },
            {
                colKey: "review",
                title: t("buildReviewStatus"),
                width: 130,
                cell: ({ row }) => (
                    <Tag theme={row.isApproved ? "success" : row.isReviewed ? "danger" : "warning"}>
                        {t(row.isApproved ? "buildApproved" : row.isReviewed ? "buildRejected" : "buildUnreviewed")}
                    </Tag>
                )
            },
            {
                colKey: "isCached",
                title: t("buildCacheStatus"),
                width: 110,
                cell: ({ row }) => (
                    <Tag theme={row.isCached ? "success" : "default"} variant="light">
                        {t(row.isCached ? "buildCached" : "buildNotCached")}
                    </Tag>
                )
            },
            {
                colKey: "isHotFix",
                title: t("pushToUsers"),
                width: 140,
                fixed: "right",
                cell: ({ row }) => (
                    <Switch
                        value={row.isHotFix}
                        loading={updatingBuildIds.has(row.id)}
                        disabled={updatingBuildIds.has(row.id)}
                        label={[t("enabled"), t("disabled")]}
                        onChange={(value) => setHotFixAsync(row, Boolean(value))}
                    />
                )
            }
        ],
        [updatingBuildIds]
    );

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Alert theme="warning" message={t("buildManagementDescription")} />
            {buildsQuery.error && <Alert theme="error" message={t("backendServerError")} />}
            <Card
                title={t("allBuilds")}
                subtitle={t("buildCount", { count: buildsQuery.data?.length ?? 0 })}
                actions={
                    <Button theme="primary" icon={<RefreshIcon />} loading={isRefreshing} onClick={refreshCacheAsync}>
                        {t("refreshBuildCacheNow")}
                    </Button>
                }>
                <PrimaryTable<AdminBuildInfo>
                    rowKey="id"
                    bordered
                    hover
                    loading={buildsQuery.isLoading}
                    data={buildsQuery.data ?? []}
                    columns={columns}
                    tableLayout="auto"
                    pagination={{ defaultPageSize: 20, total: buildsQuery.data?.length ?? 0 }}
                />
            </Card>
        </Space>
    );
}

export const Component = () => AdminBuilds();
