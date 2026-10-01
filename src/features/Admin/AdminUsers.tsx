"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    CircleCheck as CheckCircleIcon,
    CircleX as CloseCircleIcon,
    Copy as CopyIcon,
    LockKeyhole as LockOnIcon,
    Search as SearchIcon,
    Users as UsergroupIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
    Alert,
    Button,
    Card,
    DataTable,
    type DataTableColumn,
    Dialog,
    Input,
    Select,
    Space,
    Tag,
    notify
} from "../../components/marathon/index.tsx";
import Constants from "../../helpers/Constants.ts";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import {
    type AdminUserInfo,
    AdminUserType,
    type PagedResult,
    getAdminUsersAsync,
    resetAdminUserAvatarAsync,
    setAdminUserLoginBanAsync,
    updateAdminUserTypeAsync
} from "../../requests/AdminRequests.ts";
import { isSuccessfulResponse, lxBackendUrl } from "../../requests/ApiConstants.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import tableStyles from "./AdminTable.module.css";
import styles from "./AdminUsers.module.css";

async function getAdminTokenAsync() {
    return (await getStorageItemAsync(StoredAuthToken)) ?? "";
}

function getInitial(user: AdminUserInfo) {
    return (user.userName.trim()[0] ?? user.email?.trim()[0] ?? "?").toLocaleUpperCase();
}

function UserAvatar({ user, version = 0 }: { user: AdminUserInfo; version?: number }) {
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <span className={styles.avatar} aria-hidden="true">
            {imageFailed ? (
                getInitial(user)
            ) : (
                <img
                    src={`${lxBackendUrl}/Avatar/${encodeURIComponent(user.id)}?v=${version}`}
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
    const { t } = useTranslation();
    const roleOptions = () =>
        Object.values(AdminUserType)
            .filter((value): value is AdminUserType => typeof value === "number")
            .map((value) => ({ label: t(`userRole${AdminUserType[value]}`), value }));
    const queryClient = useQueryClient();
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [pendingChange, setPendingChange] = useState<{ user: AdminUserInfo; userType: AdminUserType }>();
    const [isUpdating, setIsUpdating] = useState(false);
    const [pendingAction, setPendingAction] = useState<{
        user: AdminUserInfo;
        type: "resetAvatar" | "ban" | "unban";
    }>();
    const [actionLoading, setActionLoading] = useState(false);
    const [avatarVersions, setAvatarVersions] = useState<Record<string, number>>({});

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
        await notify.success({
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
            await notify.success({
                title: t("userRoleUpdateSucceeded"),
                content: t("userRoleUpdateSucceededDescription", { user: pendingChange.user.userName }),
                placement: "top-right",
                duration: 3000,
                offset: Constants.NotificationOffset,
                attach: () => document
            });
            setPendingChange(undefined);
        } catch (error) {
            await notify.error({
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

    async function confirmUserActionAsync() {
        if (!pendingAction || actionLoading) return;
        setActionLoading(true);
        try {
            const token = await getAdminTokenAsync();
            const response =
                pendingAction.type === "resetAvatar"
                    ? await resetAdminUserAvatarAsync(token, pendingAction.user.id)
                    : await setAdminUserLoginBanAsync(token, pendingAction.user.id, pendingAction.type === "ban");
            if (response.status === 409) throw new Error(t("userBanProtected"));
            if (!isSuccessfulResponse(response)) throw new Error(t("userOperationFailed"));
            if (pendingAction.type === "resetAvatar") {
                setAvatarVersions((versions) => ({ ...versions, [pendingAction.user.id]: Date.now() }));
            }
            await queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
            void notify.success({
                title: t("userOperationSucceeded"),
                placement: "top-right",
                duration: 3000,
                offset: Constants.NotificationOffset,
                attach: () => document
            });
            setPendingAction(undefined);
        } catch (error) {
            void notify.error({
                title: t("userOperationFailed"),
                content: (error as Error).message,
                placement: "top-right",
                duration: 4000,
                offset: Constants.NotificationOffset,
                attach: () => document
            });
        } finally {
            setActionLoading(false);
        }
    }

    const columns = [
        {
            colKey: "user",
            title: t("userAccount"),
            width: 420,
            cell: ({ row }) => (
                <div className={styles.userCell}>
                    <UserAvatar
                        key={`${row.id}:${avatarVersions[row.id] ?? 0}`}
                        user={row}
                        version={avatarVersions[row.id]}
                    />
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
                        <span className={styles.email}>{row.email?.trim() || t("noEmail")}</span>
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
                    <span className={`${styles.emailStatus} ${row.qqVerified ? styles.verified : styles.unverified}`}>
                        {row.qqVerified ? <CheckCircleIcon /> : <CloseCircleIcon />}
                        {t(row.qqVerified ? "qqVerified" : "qqUnverified")}
                    </span>
                    {row.isPaid && (
                        <Tag size="small" theme="primary" variant="light">
                            {t("sponsorBadgeText")}
                        </Tag>
                    )}
                    {row.isLoginBanned && (
                        <Tag size="small" theme="danger" variant="light">
                            <LockOnIcon />
                            {t("userLoginBanned")}
                        </Tag>
                    )}
                    {!row.isLoginBanned && row.isLockedOut && (
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
            cell: ({ row }) => (
                <div className={styles.roleControl}>
                    <Select
                        className={styles.roleSelect}
                        value={row.userType}
                        disabled={isUpdating || actionLoading}
                        options={roleOptions()}
                        onChange={(value) => setPendingChange({ user: row, userType: Number(value) as AdminUserType })}
                    />
                </div>
            )
        },
        {
            colKey: "operations",
            title: t("userOperations"),
            width: 220,
            fixed: "right",
            cell: ({ row }) => (
                <Space size="small" breakLine>
                    <Button
                        size="small"
                        variant="text"
                        theme="primary"
                        disabled={isUpdating || actionLoading}
                        onClick={() => setPendingAction({ user: row, type: "resetAvatar" })}>
                        {t("resetUserAvatar")}
                    </Button>
                    <Button
                        size="small"
                        variant="text"
                        theme={row.isLoginBanned ? "primary" : "danger"}
                        disabled={isUpdating || actionLoading}
                        onClick={() => setPendingAction({ user: row, type: row.isLoginBanned ? "unban" : "ban" })}>
                        {t(row.isLoginBanned ? "unbanUserLogin" : "banUserLogin")}
                    </Button>
                </Space>
            )
        }
    ] satisfies DataTableColumn<AdminUserInfo>[];

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
                <DataTable<AdminUserInfo>
                    className={`${styles.usersTable} ${tableStyles.table}`}
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
                visible={!!pendingAction}
                theme="warning"
                confirmLoading={actionLoading}
                header={t(
                    pendingAction?.type === "resetAvatar"
                        ? "resetUserAvatar"
                        : pendingAction?.type === "ban"
                          ? "banUserLogin"
                          : "unbanUserLogin"
                )}
                closeOnOverlayClick={!actionLoading}
                onConfirm={confirmUserActionAsync}
                onClose={() => !actionLoading && setPendingAction(undefined)}>
                <div className={styles.changeSummary}>
                    <strong>{pendingAction?.user.userName}</strong>
                    <span>{pendingAction?.user.email?.trim() || t("noEmail")}</span>
                </div>
                <p>
                    {t(
                        pendingAction?.type === "resetAvatar"
                            ? "confirmResetUserAvatar"
                            : pendingAction?.type === "ban"
                              ? "confirmBanUserLogin"
                              : "confirmUnbanUserLogin",
                        { user: pendingAction?.user.userName }
                    )}
                </p>
            </Dialog>

            <Dialog
                visible={!!pendingChange}
                header={t("confirmUserRoleChange")}
                theme="warning"
                confirmLoading={isUpdating}
                closeOnOverlayClick={!isUpdating}
                onConfirm={confirmIdentityChangeAsync}
                onClose={() => !isUpdating && setPendingChange(undefined)}>
                <div className={styles.changeSummary}>
                    {pendingChange && <UserAvatar key={pendingChange.user.id} user={pendingChange.user} />}
                    <div>
                        <strong>{pendingChange?.user.userName}</strong>
                        <span>{pendingChange?.user.email?.trim() || t("noEmail")}</span>
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
