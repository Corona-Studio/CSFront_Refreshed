import { useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import { useEffect, useMemo, useState } from "react";
import { SearchIcon, UsergroupIcon } from "tdesign-icons-react";
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
import styles from "./AdminManagement.module.css";

async function getAdminTokenAsync() {
    return (await getStorageItemAsync(StoredAuthToken)) ?? "";
}

const roleOptions = () =>
    Object.values(AdminUserType)
        .filter((value): value is AdminUserType => typeof value === "number")
        .map((value) => ({ label: t(`userRole${AdminUserType[value]}`), value }));

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
                width: 300,
                cell: ({ row }) => (
                    <div className={styles.identityCell}>
                        <strong>{row.userName || t("unnamedUser")}</strong>
                        <span className={styles.muted}>{row.email}</span>
                        <span className={styles.muted}>{row.id}</span>
                    </div>
                )
            },
            {
                colKey: "status",
                title: t("accountStatus"),
                width: 210,
                cell: ({ row }) => (
                    <div className={styles.statusList}>
                        <Tag theme={row.emailConfirmed ? "success" : "warning"} variant="light">
                            {t(row.emailConfirmed ? "emailVerified" : "emailUnverified")}
                        </Tag>
                        {row.isPaid && <Tag theme="primary">{t("sponsorBadgeText")}</Tag>}
                        {row.isLockedOut && <Tag theme="danger">{t("accountLocked")}</Tag>}
                    </div>
                )
            },
            {
                colKey: "userType",
                title: t("userIdentity"),
                width: 220,
                fixed: "right",
                cell: ({ row }) => (
                    <Select
                        className={styles.roleSelect}
                        value={row.userType}
                        options={roleOptions()}
                        onChange={(value) => setPendingChange({ user: row, userType: Number(value) as AdminUserType })}
                    />
                )
            }
        ],
        []
    );

    return (
        <Space direction="vertical" size="large" className={styles.page}>
            <Alert theme="info" message={t("userManagementDescription")} />
            {usersQuery.error && (
                <Alert
                    theme="error"
                    title={t("userListLoadFailed")}
                    message={(usersQuery.error as Error).message}
                    operation={<Button onClick={() => usersQuery.refetch()}>{t("retry")}</Button>}
                />
            )}
            <Card>
                <div className={styles.toolbar}>
                    <div>
                        <h3>
                            <UsergroupIcon /> {t("userManagement")}
                        </h3>
                        <p>{t("managedUserCount", { count: usersQuery.data?.totalCount ?? 0 })}</p>
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
                    rowKey="id"
                    hover
                    stripe
                    loading={usersQuery.isLoading || usersQuery.isFetching}
                    data={usersQuery.data?.items ?? []}
                    columns={columns}
                    tableLayout="fixed"
                    empty={t("noUsers")}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: usersQuery.data?.totalCount ?? 0,
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
