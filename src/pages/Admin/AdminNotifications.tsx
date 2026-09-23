import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { useEffect, useMemo, useState } from "react";
import { AddIcon, DeleteIcon, EditIcon, NotificationIcon, SearchIcon } from "tdesign-icons-react";
import {
    Alert,
    Button,
    Card,
    Dialog,
    Input,
    NotificationPlugin,
    PrimaryTable,
    type PrimaryTableCol,
    Space,
    Tag,
    Textarea
} from "tdesign-react";

import Constants from "../../helpers/Constants.ts";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import {
    type AdminNotificationInfo,
    createAdminNotificationAsync,
    deleteAdminNotificationAsync,
    getAdminNotificationsAsync,
    updateAdminNotificationAsync
} from "../../requests/AdminRequests.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import styles from "./AdminManagement.module.css";

interface NotificationDraft {
    title: string;
    author: string;
    content: string;
}

const emptyDraft: NotificationDraft = { title: "", author: "", content: "" };

async function getAdminTokenAsync() {
    return (await getStorageItemAsync(StoredAuthToken)) ?? "";
}

function AdminNotifications() {
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
    const [editing, setEditing] = useState<AdminNotificationInfo>();
    const [draft, setDraft] = useState<NotificationDraft>(emptyDraft);
    const [formVisible, setFormVisible] = useState(false);
    const [deleting, setDeleting] = useState<AdminNotificationInfo>();
    const [isMutating, setIsMutating] = useState(false);
    const [validationAttempted, setValidationAttempted] = useState(false);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setSearch(searchInput.trim());
            setPagination((value) => ({ ...value, current: 1 }));
        }, 350);
        return () => window.clearTimeout(timeout);
    }, [searchInput]);

    const notificationsQuery = useQuery({
        queryKey: ["adminNotifications", search, pagination.current, pagination.pageSize],
        queryFn: async () => {
            const response = await getAdminNotificationsAsync(
                await getAdminTokenAsync(),
                search,
                pagination.current,
                pagination.pageSize
            );
            if (!response || response.status !== 200 || !response.response)
                throw new Error(t("notificationListLoadFailedDescription"));
            return response.response;
        }
    });

    function openCreateDialog() {
        setEditing(undefined);
        setDraft(emptyDraft);
        setValidationAttempted(false);
        setFormVisible(true);
    }

    function openEditDialog(notification: AdminNotificationInfo) {
        setEditing(notification);
        setDraft({ title: notification.title, author: notification.author, content: notification.content });
        setValidationAttempted(false);
        setFormVisible(true);
    }

    async function saveNotificationAsync() {
        setValidationAttempted(true);
        if (!draft.title.trim() || !draft.author.trim() || !draft.content.trim()) return;

        setIsMutating(true);
        try {
            const token = await getAdminTokenAsync();
            const request = { title: draft.title.trim(), author: draft.author.trim(), content: draft.content.trim() };
            const response = editing
                ? await updateAdminNotificationAsync(token, editing.id, request)
                : await createAdminNotificationAsync(token, request);
            if (!response || response.status !== 200 || !response.response)
                throw new Error(t("notificationSaveFailedDescription"));

            setFormVisible(false);
            await notificationsQuery.refetch();
            await NotificationPlugin.success({
                title: t("notificationSaveSucceeded"),
                content: t(editing ? "notificationUpdatedDescription" : "notificationCreatedDescription"),
                placement: "top-right",
                duration: 3000,
                offset: Constants.NotificationOffset,
                attach: () => document
            });
        } catch (error) {
            await NotificationPlugin.error({
                title: t("notificationSaveFailed"),
                content: (error as Error).message,
                placement: "top-right",
                duration: 4000,
                offset: Constants.NotificationOffset,
                attach: () => document
            });
        } finally {
            setIsMutating(false);
        }
    }

    async function deleteNotificationAsync() {
        if (!deleting) return;
        setIsMutating(true);
        try {
            const response = await deleteAdminNotificationAsync(await getAdminTokenAsync(), deleting.id);
            if (!response || response.status !== 200) throw new Error(t("notificationDeleteFailedDescription"));

            setDeleting(undefined);
            if ((notificationsQuery.data?.items.length ?? 0) === 1 && pagination.current > 1)
                setPagination((value) => ({ ...value, current: value.current - 1 }));
            else await notificationsQuery.refetch();

            await NotificationPlugin.success({
                title: t("notificationDeleteSucceeded"),
                content: t("notificationDeleteSucceededDescription"),
                placement: "top-right",
                duration: 3000,
                offset: Constants.NotificationOffset,
                attach: () => document
            });
        } catch (error) {
            await NotificationPlugin.error({
                title: t("notificationDeleteFailed"),
                content: (error as Error).message,
                placement: "top-right",
                duration: 4000,
                offset: Constants.NotificationOffset,
                attach: () => document
            });
        } finally {
            setIsMutating(false);
        }
    }

    const columns = useMemo<PrimaryTableCol<AdminNotificationInfo>[]>(
        () => [
            {
                colKey: "notification",
                title: t("notification"),
                width: 420,
                cell: ({ row }) => (
                    <div className={styles.notificationCell}>
                        <strong>{row.title}</strong>
                        <span className={styles.contentPreview}>{row.content}</span>
                    </div>
                )
            },
            {
                colKey: "author",
                title: t("notificationAuthor"),
                width: 180,
                cell: ({ row }) => <Tag variant="light">{row.author}</Tag>
            },
            {
                colKey: "publishDate",
                title: t("publishDate"),
                width: 190,
                cell: ({ row }) => new Date(row.publishDate).toLocaleString()
            },
            {
                colKey: "actions",
                title: t("actions"),
                width: 180,
                fixed: "right",
                cell: ({ row }) => (
                    <div className={styles.actions}>
                        <Button variant="outline" icon={<EditIcon />} onClick={() => openEditDialog(row)}>
                            {t("edit")}
                        </Button>
                        <Button theme="danger" variant="outline" icon={<DeleteIcon />} onClick={() => setDeleting(row)}>
                            {t("delete")}
                        </Button>
                    </div>
                )
            }
        ],
        []
    );

    return (
        <Space direction="vertical" size="large" className={styles.page}>
            <Alert theme="info" message={t("notificationManagementDescription")} />
            {notificationsQuery.error && (
                <Alert
                    theme="error"
                    title={t("notificationListLoadFailed")}
                    message={(notificationsQuery.error as Error).message}
                    operation={<Button onClick={() => notificationsQuery.refetch()}>{t("retry")}</Button>}
                />
            )}
            <Card>
                <div className={styles.toolbar}>
                    <div>
                        <h3>
                            <NotificationIcon /> {t("notificationManagement")}
                        </h3>
                        <p>{t("notificationCount", { count: notificationsQuery.data?.totalCount ?? 0 })}</p>
                    </div>
                    <div className={styles.toolbarActions}>
                        <Input
                            className={styles.searchInput}
                            value={searchInput}
                            clearable
                            prefixIcon={<SearchIcon />}
                            placeholder={t("searchNotifications")}
                            onChange={(value) => setSearchInput(String(value))}
                        />
                        <Button theme="primary" icon={<AddIcon />} onClick={openCreateDialog}>
                            {t("createNotification")}
                        </Button>
                    </div>
                </div>
                <PrimaryTable<AdminNotificationInfo>
                    rowKey="id"
                    hover
                    stripe
                    loading={notificationsQuery.isLoading || notificationsQuery.isFetching}
                    data={notificationsQuery.data?.items ?? []}
                    columns={columns}
                    tableLayout="fixed"
                    empty={t("noNotifications")}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: notificationsQuery.data?.totalCount ?? 0,
                        pageSizeOptions: [10, 20, 50, 100],
                        showPageSize: true,
                        showJumper: true,
                        onChange: ({ current, pageSize }) => setPagination({ current, pageSize })
                    }}
                />
            </Card>

            <Dialog
                visible={formVisible}
                header={t(editing ? "editNotification" : "createNotification")}
                confirmLoading={isMutating}
                closeOnOverlayClick={!isMutating}
                width="min(680px, 92vw)"
                onConfirm={saveNotificationAsync}
                onClose={() => !isMutating && setFormVisible(false)}>
                <div className={styles.dialogForm}>
                    <div className={styles.field}>
                        <label>{t("notificationTitle")}</label>
                        <Input
                            maxlength={200}
                            value={draft.title}
                            onChange={(value) => setDraft((current) => ({ ...current, title: String(value) }))}
                        />
                        {validationAttempted && !draft.title.trim() && (
                            <div className={styles.fieldError}>{t("fieldRequired")}</div>
                        )}
                    </div>
                    <div className={styles.field}>
                        <label>{t("notificationAuthor")}</label>
                        <Input
                            maxlength={200}
                            value={draft.author}
                            onChange={(value) => setDraft((current) => ({ ...current, author: String(value) }))}
                        />
                        {validationAttempted && !draft.author.trim() && (
                            <div className={styles.fieldError}>{t("fieldRequired")}</div>
                        )}
                    </div>
                    <div className={styles.field}>
                        <label>{t("notificationContent")}</label>
                        <Textarea
                            maxlength={20000}
                            autosize={{ minRows: 6, maxRows: 14 }}
                            value={draft.content}
                            onChange={(value) => setDraft((current) => ({ ...current, content: String(value) }))}
                        />
                        {validationAttempted && !draft.content.trim() && (
                            <div className={styles.fieldError}>{t("fieldRequired")}</div>
                        )}
                    </div>
                </div>
            </Dialog>

            <Dialog
                visible={!!deleting}
                header={t("confirmDeleteNotification")}
                theme="danger"
                confirmLoading={isMutating}
                closeOnOverlayClick={!isMutating}
                onConfirm={deleteNotificationAsync}
                onClose={() => !isMutating && setDeleting(undefined)}>
                <p>{t("confirmDeleteNotificationDescription", { title: deleting?.title })}</p>
            </Dialog>
        </Space>
    );
}

export const Component = () => AdminNotifications();
