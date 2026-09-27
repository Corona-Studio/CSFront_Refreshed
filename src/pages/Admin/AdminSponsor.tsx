import { useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import { useEffect, useMemo, useState } from "react";
import { CopyIcon, MailIcon, SearchIcon } from "tdesign-icons-react";
import {
    Alert,
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Form,
    type FormProps,
    Input,
    NotificationPlugin,
    PrimaryTable,
    type PrimaryTableCol,
    Row,
    Space,
    Tag
} from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import {
    type UserSponsorInfo,
    getSponsorUsersAsync,
    querySponsorInfoAsync,
    setUserAsSponsorAsync
} from "../../requests/AdminRequests.ts";
import { lxBackendUrl } from "../../requests/ApiConstants.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import Constants from "./../../helpers/Constants.ts";
import styles from "./AdminSponsor.module.css";

interface FormData {
    email?: string;
}

async function getAdminTokenAsync() {
    return (await getStorageItemAsync(StoredAuthToken)) ?? "";
}

function formatRedeemTime(value?: string | null) {
    return value ? new Date(value).toLocaleString() : t("manualSponsorGrant");
}

function AdminSponsor() {
    const queryClient = useQueryClient();
    const [isQuerying, setIsQuerying] = useState(false);
    const [isSetting, setIsSetting] = useState(false);
    const [error, setError] = useState<string>();
    const [userInfo, setUserInfo] = useState<UserSponsorInfo>();
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setSearch(searchInput.trim());
            setPagination((value) => ({ ...value, current: 1 }));
        }, 350);
        return () => window.clearTimeout(timeout);
    }, [searchInput]);

    const sponsorsQuery = useQuery({
        queryKey: ["adminSponsors", search, pagination.current, pagination.pageSize],
        queryFn: async () => {
            const response = await getSponsorUsersAsync(
                await getAdminTokenAsync(),
                search,
                pagination.current,
                pagination.pageSize
            );
            if (!response || response.status !== 200 || !response.response)
                throw new Error(t("sponsorListLoadFailedDescription"));
            return response.response;
        }
    });

    const onQuerySponsorSubmit: FormProps["onSubmit"] = (event) => {
        if (event.validateResult !== true) return;
        const formData = event.fields as FormData;

        setError(undefined);
        setUserInfo(undefined);
        setIsQuerying(true);
        getAdminTokenAsync()
            .then((token) => querySponsorInfoAsync(token, formData.email!))
            .then((response) => {
                if (!response || !response.status) throw new Error(t("backendServerError"));
                if (response.status === 404) throw new Error(t("userNotFound"));
                if (!response.response) throw new Error(t("backendServerError"));
                setUserInfo(response.response);
            })
            .catch((requestError) => setError((requestError as Error).message))
            .finally(() => setIsQuerying(false));
    };

    const onSetSponsorSubmit: FormProps["onSubmit"] = (event) => {
        if (event.validateResult !== true) return;
        const formData = event.fields as FormData;

        setIsSetting(true);
        getAdminTokenAsync()
            .then((token) => setUserAsSponsorAsync(token, formData.email!))
            .then(async (response) => {
                if (!response || !response.status) throw new Error(t("backendServerError"));
                if (response.status === 400) throw new Error(t("userAlreadySponsor"));
                if (response.status === 404) throw new Error(t("userNotFound"));
                if (!response.response) throw new Error(t("backendServerError"));

                await queryClient.invalidateQueries({ queryKey: ["adminSponsors"] });
                await NotificationPlugin.success({
                    title: t("setSponsorSucceeded"),
                    content: t("setSponsorSucceededDescription"),
                    placement: "top-right",
                    duration: 3000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });
            })
            .catch(async (requestError) => {
                await NotificationPlugin.error({
                    title: t("setSponsorFailed"),
                    content: (requestError as Error).message,
                    placement: "top-right",
                    duration: 3000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });
            })
            .finally(() => setIsSetting(false));
    };

    async function copyOrderNumberAsync(orderNumber: string) {
        await navigator.clipboard.writeText(orderNumber);
        await NotificationPlugin.success({
            title: t("orderNumberCopied"),
            content: orderNumber,
            placement: "top-right",
            duration: 1600,
            offset: Constants.NotificationOffset,
            attach: () => document
        });
    }

    const columns = useMemo<PrimaryTableCol<UserSponsorInfo>[]>(
        () => [
            {
                colKey: "user",
                title: t("userAccount"),
                width: 360,
                cell: ({ row }) => (
                    <div className={styles.tableUser}>
                        <Avatar
                            image={`${lxBackendUrl}/Avatar/${encodeURIComponent(row.id)}`}
                            shape="round"
                            size="40px"
                        />
                        <div className={styles.userDetails}>
                            <strong>{row.userName || t("unnamedUser")}</strong>
                            <span>{row.email}</span>
                            <code title={row.id}>{row.id}</code>
                        </div>
                    </div>
                )
            },
            {
                colKey: "orderNumber",
                title: t("redeemOrderNumber"),
                width: 250,
                cell: ({ row }) =>
                    row.orderNumber ? (
                        <button
                            type="button"
                            className={styles.copyValue}
                            title={t("copyOrderNumber")}
                            onClick={() => copyOrderNumberAsync(row.orderNumber!)}>
                            <code>{row.orderNumber}</code>
                            <CopyIcon />
                        </button>
                    ) : (
                        <Tag size="small" variant="light">
                            {t("manualSponsorGrant")}
                        </Tag>
                    )
            },
            {
                colKey: "redeemTime",
                title: t("redeemTime"),
                width: 200,
                cell: ({ row }) => <span className={styles.redeemTime}>{formatRedeemTime(row.redeemTime)}</span>
            }
        ],
        []
    );

    const totalCount = sponsorsQuery.data?.totalCount ?? 0;

    return (
        <Space direction="vertical" size="large" className={styles.page}>
            <Row gutter={[16, 16]} className={styles.formGrid}>
                <Col span={12} sm={12} md={6}>
                    <Card
                        className={styles.formCard}
                        title={t("querySponsorInfo")}
                        subtitle={t("querySponsorInfoDescription")}>
                        <Form statusIcon colon labelWidth={0} onSubmit={onQuerySponsorSubmit}>
                            <FormItem
                                name="email"
                                rules={[
                                    { required: true, message: t("emailRequired"), type: "error" },
                                    { email: true, message: t("emailIncorrectMessage") }
                                ]}>
                                <Input
                                    disabled={isQuerying}
                                    clearable
                                    prefixIcon={<MailIcon />}
                                    placeholder={t("pleaseInputEmail")}
                                />
                            </FormItem>
                            <div className={styles.formActions}>
                                <Button loading={isQuerying} theme="primary" type="submit">
                                    {t("query")}
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
                <Col span={12} sm={12} md={6}>
                    <Card
                        className={styles.formCard}
                        title={t("setUserAsSponsor")}
                        subtitle={t("setUserAsSponsorDescription")}>
                        <Form statusIcon colon labelWidth={0} onSubmit={onSetSponsorSubmit}>
                            <FormItem
                                name="email"
                                rules={[
                                    { required: true, message: t("emailRequired"), type: "error" },
                                    { email: true, message: t("emailIncorrectMessage") }
                                ]}>
                                <Input clearable prefixIcon={<MailIcon />} placeholder={t("pleaseInputEmail")} />
                            </FormItem>
                            <div className={styles.formActions}>
                                <Button loading={isSetting} theme="danger" type="submit">
                                    {t("submit")}
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>

            {error && <Alert theme="error" message={error} />}

            {userInfo && (
                <Card className={styles.resultCard} title={t("queriedSponsorInfo")}>
                    <div className={styles.userResult}>
                        <Avatar
                            image={`${lxBackendUrl}/Avatar/${encodeURIComponent(userInfo.id)}`}
                            shape="round"
                            size="56px"
                        />
                        <div className={styles.userDetails}>
                            <strong>{userInfo.userName}</strong>
                            <span>{userInfo.email}</span>
                            <code title={userInfo.id}>{userInfo.id}</code>
                        </div>
                        <div className={styles.queryMetadata}>
                            <div>
                                <span>{t("redeemOrderNumber")}</span>
                                <strong>{userInfo.orderNumber ?? t("noRedeemRecord")}</strong>
                            </div>
                            <div>
                                <span>{t("redeemTime")}</span>
                                <strong>
                                    {userInfo.redeemTime
                                        ? formatRedeemTime(userInfo.redeemTime)
                                        : t(userInfo.isPaid ? "manualSponsorGrant" : "noRedeemRecord")}
                                </strong>
                            </div>
                        </div>
                        <Badge
                            count={t(userInfo.isPaid ? "isPaid" : "notPay")}
                            shape="circle"
                            size="medium"
                            color={userInfo.isPaid ? "green" : "yellow"}
                        />
                    </div>
                </Card>
            )}

            {sponsorsQuery.error && (
                <Alert
                    theme="error"
                    title={t("sponsorListLoadFailed")}
                    message={(sponsorsQuery.error as Error).message}
                    operation={<Button onClick={() => sponsorsQuery.refetch()}>{t("retry")}</Button>}
                />
            )}

            <Card className={styles.sponsorsCard}>
                <div className={styles.toolbar}>
                    <div className={styles.listTitle}>
                        <h3>{t("sponsoredUsers")}</h3>
                        <span>{t("sponsorCount", { count: totalCount.toLocaleString() })}</span>
                    </div>
                    <Input
                        className={styles.searchInput}
                        value={searchInput}
                        clearable
                        prefixIcon={<SearchIcon />}
                        placeholder={t("searchSponsors")}
                        onChange={(value) => setSearchInput(String(value))}
                    />
                </div>
                <PrimaryTable<UserSponsorInfo>
                    className={styles.sponsorsTable}
                    rowKey="id"
                    hover
                    loading={sponsorsQuery.isLoading || sponsorsQuery.isFetching}
                    data={sponsorsQuery.data?.items ?? []}
                    columns={columns}
                    tableLayout="fixed"
                    empty={t("noSponsors")}
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
        </Space>
    );
}

export const Component = () => AdminSponsor();
