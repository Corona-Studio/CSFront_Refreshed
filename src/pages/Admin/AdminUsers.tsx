import { useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import { useEffect, useMemo, useState } from "react";
import { CheckCircleIcon, CloseCircleIcon, CopyIcon, LockOnIcon, SearchIcon, UsergroupIcon } from "tdesign-icons-react";
import {
    Alert,
    Button,
    Card,
    Dialog,
    Input,
    NotificationPlugin,
    PrimaryTable,
    type PrimaryTableCol,
    Select,
    Space,
    Tag
} from "tdesign-react";

import Constants from "../../helpers/Constants.ts";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import {
    type AdminUserInfo,
    AdminUserType,
    type PagedResult,
    getAdminUsersAsync,
    updateAdminUserTypeAsync
} from "../../requests/AdminRequests.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import { lxBackendUrl } from "../../requests/ApiConstants.ts";
import styles from "./AdminUsers.module.css";

async function getAdminTokenAsync() {
    return (await getStorageItemAsync(StoredAuthToken)) ?? "";
}

const roleOptions = () =>
    Object.values(AdminUserType)
        .filter((value): value is AdminUserType => typeof value === "number")
        .map((value) => ({ label: t(`userRole${AdminUserType[value]}`), value }));

function getInitial(user: AdminUserInfo) {
    return (user.userName.trim()[0] ?? user.email.trim()[0] ?? "?").toLocaleUpperCase();
}

function UserAvatar({ user }: { user: AdminUserInfo }) {
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => setImageFailed(false), [user.id]);

    return (
        <span className={styles.avatar} aria-hidden="true">
            {imageFailed ? (
                getInitial(user)
            ) : (
                <img
                    src={`${lxBackendUrl}/Avatar/${encodeURIComponent(user.id)}`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={() => setImageFailed(true)}
                />
            )}
        </span>
    );
}

function AdminUsers() {
    const queryClient = useQueryClient();
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [pendingChange, setPendingChange] = useState<{ user: AdminUserInfo; userType: AdminUserType }>();
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setSearch(searchInput.trim());
            setPagination((value) => ({ ...value, current: 1 }));
        }, 350);
        return () => window.clearTimeout(timeout);
    }, [searchInput]);

    const queryKey = ["adminUsers", search, pagination.current, pagination.pageSize];
    const usersQuery = useQuery({
        queryKey,
        queryFn: async () => {
            const response = await getAdminUsersAsync(
                await getAdminTokenAsync(),
                search,
                pagination.current,
                pagination.pageSize
            );
            if (!response || response.status !== 200 || !response.response)
                throw new Error(t("userListLoadFailedDescription"));
            return response.response;
        }
    });

    async function copyUserIdAsync(userId: string) {
        await navigator.clipboard.writeText(userId);
        await NotificationPlugin.success({
            title: t("userIdCopied"),
            content: userId,
            placement: "top-right",
            duration: 1600,
            offset: Constants.NotificationOffset,
            attach: () => document
        });
    }

    async function confirmIdentityChangeAsync() {
        if (!pendingChange) return;
        setIsUpdating(true);
        try {
            const response = await updateAdminUserTypeAsync(
                await getAdminTokenAsync(),
                pendingChange.user.id,
                pendingChange.userType
            );
            if (!response || response.status !== 200 || !response.response) {
                throw new Error(
                    response?.status === 409 ? t("userRoleProtectedDescription") : t("userRoleUpdateFailedDescription")
                );
            }

            queryClient.setQueryData<PagedResult<AdminUserInfo>>(queryKey, (data) =>
                data
                    ? {
                          ...data,
                          items: data.items.map((user) =>
                              user.id === response.response!.id ? response.response! : user
                          )
                      }
                    : data
            );
            await NotificationPlugin.success({
                title: t("userRoleUpdateSucceeded"),
                content: t("userRoleUpdateSucceededDescription", { user: pendingChange.user.userName }),
                placement: "top-right",
                duration: 3000,
                offset: Constants.NotificationOffset,
                attach: () => document
            });
            setPendingChange(undefined);
        } catch (error) {
            await NotificationPlugin.error({
                title: t("userRoleUpdateFailed"),
                content: (error as Error).message,
                placement: "top-right",
                duration: 4000,
                offset: Constants.NotificationOffset,
                attach: () => document
            });
        } finally {
            setIsUpdating(false);
        }
    }

    const columns = useMemo<PrimaryTableCol<AdminUserInfo>[]>(
        () => [
            {
                colKey: "user",
                title: t("userAccount"),
                width: 420,
                cell: ({ row }) => (
                    <div className={styles.userCell}>
                        <UserAvatar user={row} />
                        <div className={styles.userDetails}>
                            <div className={styles.nameRow}>
                                <strong title={row.userName}>{row.userName || t("unnamedUser")}</strong>
                                <button
                                    type="button"
                                    className={styles.idButton}
                                    title={`${t("copyUserId")}: ${row.id}`}
                                    aria-label={`${t("copyUserId")}: ${row.id}`}
                                    onClick={() => copyUserIdAsync(row.id)}>
                                    <span>{row.id.slice(0, 8)}</span>
                                    <CopyIcon />
                                </button>
                            </div>
                            <span className={styles.email}>{row.email}</span>
                        </div>
                    </div>
                )
            },
            {
                colKey: "status",
                title: t("accountStatus"),
                width: 240,
                cell: ({ row }) => (
                    <div className={styles.statusList}>
                        <span className={`${styles.emailStatus} ${row.emailConfirmed ? styles.verified : styles.unverified}`}>
                            {row.emailConfirmed ? <CheckCircleIcon /> : <CloseCircleIcon />}
                            {t(row.emailConfirmed ? "emailVerified" : "emailUnverified")}
                        </span>
                        {row.isPaid && (
                            <Tag size="small" theme="primary" variant="light">
                                {t("sponsorBadgeText")}
                            </Tag>
                        )}
                        {row.isLockedOut && (
                            <Tag size="small" theme="danger" variant="light">
                                <LockOnIcon />
                                {t("accountLocked")}
                            </Tag>
                        )}
                    </div>
                )
            },
            {
                colKey: "userType",
                title: t("userIdentity"),
                width: 190,
                fixed: "right",
                cell: ({ row }) => (
                    <div className={styles.roleControl}>
                        <Select
                            className={styles.roleSelect}
                            value={row.userType}
                            options={roleOptions()}
                            onChange={(value) =>
                                setPendingChange({ user: row, userType: Number(value) as AdminUserType })
                            }
                        />
                    </div>
                )
            }
        ],
        []
    );

    const totalCount = usersQuery.data?.totalCount ?? 0;

    return (
        <Space direction="vertical" size="large" className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroLead}>
                    <span className={styles.heroIcon}>
                        <UsergroupIcon />
                    </span>
                    <div>
                        <h2>{t("accountDirectory")}</h2>
                        <p>{t("userManagementDescription")}</p>
                    </div>
                </div>
                <div className={styles.totalMetric}>
                    <strong>{totalCount.toLocaleString()}</strong>
                    <span>{t(search ? "matchingUsers" : "totalUsers")}</span>
                </div>
            </section>

            {usersQuery.error && (
                <Alert
                    theme="error"
                    title={t("userListLoadFailed")}
                    message={(usersQuery.error as Error).message}
                    operation={<Button onClick={() => usersQuery.refetch()}>{t("retry")}</Button>}
                />
            )}

            <Card className={styles.usersCard}>
                <div className={styles.toolbar}>
                    <div className={styles.listTitle}>
                        <h3>{t(search ? "searchResults" : "allUserAccounts")}</h3>
                        <span>{t("managedUserCount", { count: totalCount.toLocaleString() })}</span>
                    </div>
                    <Input
                        className={styles.searchInput}
                        value={searchInput}
                        clearable
                        prefixIcon={<SearchIcon />}
                        placeholder={t("searchUsers")}
                        onChange={(value) => setSearchInput(String(value))}
                    />
                </div>
                <PrimaryTable<AdminUserInfo>
                    className={styles.usersTable}
                    rowKey="id"
                    hover
                    loading={usersQuery.isLoading || usersQuery.isFetching}
                    data={usersQuery.data?.items ?? []}
                    columns={columns}
                    tableLayout="fixed"
                    empty={t("noUsers")}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: totalCount,
                        pageSizeOptions: [10, 20, 50, 100],
                        showPageSize: true,
                        showJumper: true,
                        onChange: ({ current, pageSize }) => setPagination({ current, pageSize })
                    }}
                />
            </Card>

            <Dialog
                visible={!!pendingChange}
                header={t("confirmUserRoleChange")}
                theme="warning"
                confirmLoading={isUpdating}
                closeOnOverlayClick={!isUpdating}
                onConfirm={confirmIdentityChangeAsync}
                onClose={() => !isUpdating && setPendingChange(undefined)}>
                <div className={styles.changeSummary}>
                    {pendingChange && <UserAvatar user={pendingChange.user} />}
                    <div>
                        <strong>{pendingChange?.user.userName}</strong>
                        <span>{pendingChange?.user.email}</span>
                    </div>
                </div>
                <p>
                    {t("confirmUserRoleChangeDescription", {
                        user: pendingChange?.user.userName,
                        role: pendingChange ? t(`userRole${AdminUserType[pendingChange.userType]}`) : ""
                    })}
                </p>
                <Alert theme="warning" message={t("userRoleTokenNotice")} />
            </Dialog>
        </Space>
    );
}

export const Component = () => AdminUsers();
