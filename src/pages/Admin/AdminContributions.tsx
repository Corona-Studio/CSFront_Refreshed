import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRightIcon, GitRepositoryCommitsIcon, SearchIcon, StarIcon } from "tdesign-icons-react";
import { Alert, Button, Card, Input, PrimaryTable, type PrimaryTableCol, Space, Tag } from "tdesign-react";

import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import { type PendingContributionSummary, getPendingContributionsAsync } from "../../requests/AdminRequests.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import styles from "./AdminContributions.module.css";

const queryKey = ["adminContributions"];

async function getAdminTokenAsync() {
    return (await getStorageItemAsync(StoredAuthToken)) ?? "";
}

function AdminContributions() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 15 });

    const contributionsQuery = useQuery({
        queryKey,
        queryFn: async () => {
            const response = await getPendingContributionsAsync(await getAdminTokenAsync());

            if (!response || response.status !== 200 || !response.response)
                throw new Error(t("contributionListLoadFailedDescription"));

            return response.response;
        }
    });

    const filteredContributions = useMemo(() => {
        const keyword = searchText.trim().toLocaleLowerCase();
        const sorted = [...(contributionsQuery.data ?? [])].sort(
            (left, right) => right.contributionCount - left.contributionCount || right.rating - left.rating
        );

        if (!keyword) return sorted;

        return sorted.filter((item) =>
            [item.id, item.originalName, item.translatedName ?? ""].join(" ").toLocaleLowerCase().includes(keyword)
        );
    }, [contributionsQuery.data, searchText]);

    const stats = useMemo(
        () => ({
            resources: contributionsQuery.data?.length ?? 0,
            submissions: contributionsQuery.data?.reduce((total, item) => total + item.contributionCount, 0) ?? 0,
            rated: contributionsQuery.data?.filter((item) => item.rating > 0).length ?? 0
        }),
        [contributionsQuery.data]
    );

    const columns = useMemo<PrimaryTableCol<PendingContributionSummary>[]>(
        () => [
            {
                colKey: "resource",
                title: t("contributionResource"),
                width: 330,
                cell: ({ row }) => (
                    <div className={styles.resourceCell}>
                        <strong>{row.originalName}</strong>
                        <span className={styles.muted}>{row.translatedName || t("notTranslated")}</span>
                        <code className={styles.ellipsis}>{row.id}</code>
                    </div>
                )
            },
            {
                colKey: "contributionCount",
                title: t("submissionCount"),
                width: 140,
                sorter: (left, right) => left.contributionCount - right.contributionCount,
                cell: ({ row }) => (
                    <Tag theme={row.contributionCount > 0 ? "primary" : "default"}>{row.contributionCount}</Tag>
                )
            },
            {
                colKey: "rating",
                title: t("userRating"),
                width: 140,
                sorter: (left, right) => left.rating - right.rating,
                cell: ({ row }) =>
                    row.rating > 0 ? (
                        <Space size="small">
                            <StarIcon />
                            <span>{row.rating.toFixed(1)}</span>
                        </Space>
                    ) : (
                        <span className={styles.muted}>{t("noRating")}</span>
                    )
            },
            {
                colKey: "actions",
                title: t("actions"),
                width: 120,
                fixed: "right",
                cell: ({ row }) => (
                    <Button
                        variant="outline"
                        icon={<ChevronRightIcon />}
                        onClick={() => navigate(`/admin/contributions/${encodeURIComponent(row.id)}`)}>
                        {t("review")}
                    </Button>
                )
            }
        ],
        [navigate]
    );

    return (
        <Space direction="vertical" size="large" className={styles.page}>
            <Alert theme="info" message={t("contributionManagementDescription")} />
            {contributionsQuery.error && (
                <Alert
                    theme="error"
                    title={t("contributionListLoadFailed")}
                    message={(contributionsQuery.error as Error).message}
                    operation={<Button onClick={() => contributionsQuery.refetch()}>{t("retry")}</Button>}
                />
            )}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <GitRepositoryCommitsIcon />
                    <div>
                        <strong>{stats.resources}</strong>
                        <span>{t("pendingResources")}</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <ChevronRightIcon />
                    <div>
                        <strong>{stats.submissions}</strong>
                        <span>{t("totalSubmissions")}</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <StarIcon />
                    <div>
                        <strong>{stats.rated}</strong>
                        <span>{t("ratedResources")}</span>
                    </div>
                </div>
            </div>
            <Card>
                <div className={styles.toolbar}>
                    <div>
                        <h3>{t("pendingContributionList")}</h3>
                        <p>{t("pendingContributionCount", { count: filteredContributions.length })}</p>
                    </div>
                    <Input
                        className={styles.searchInput}
                        value={searchText}
                        clearable
                        prefixIcon={<SearchIcon />}
                        placeholder={t("searchContributions")}
                        onChange={(value) => {
                            setSearchText(String(value));
                            setPagination((current) => ({ ...current, current: 1 }));
                        }}
                    />
                </div>
                <PrimaryTable<PendingContributionSummary>
                    rowKey="id"
                    hover
                    stripe
                    loading={contributionsQuery.isLoading}
                    data={filteredContributions}
                    columns={columns}
                    tableLayout="fixed"
                    empty={t("noPendingContributions")}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: filteredContributions.length,
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

export const Component = () => AdminContributions();
