"use client";
import { useQuery } from "@tanstack/react-query";
import { CircleCheck as CheckCircleIcon, Copy as CopyIcon, Users as UsergroupIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
    Alert,
    Button,
    Card,
    Col,
    Comment,
    Divider,
    Form,
    type FormProps,
    Input,
    Loading,
    Row,
    notify
} from "../../components/marathon/index.tsx";
import { FormItem } from "../../components/marathon/index.tsx";
import { checkIsPaidImpl } from "../../helpers/PaymentHelper.ts";
import { clearSessionAsync } from "../../helpers/SessionHelper.ts";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import { AfdOrderNumberPattern } from "../../helpers/ValidationRules.ts";
import { isVerificationCodeExpired } from "../../helpers/VerificationHelper.ts";
import { useNavigate } from "../../lib/navigation.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import { getCurrentVerificationAsync, redeemAsync } from "../../requests/LxUserRequests.ts";
import Constants from "./../../helpers/Constants.ts";

interface FormData {
    orderNumber?: string;
}

function UserSponsor() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [recentlyRedeemed, setRecentlyRedeemed] = useState(false);
    const [now, setNow] = useState(0);

    useEffect(() => {
        const initialTimer = window.setTimeout(() => setNow(Date.now()), 0);
        const timer = window.setInterval(() => setNow(Date.now()), 30_000);
        return () => {
            window.clearTimeout(initialTimer);
            window.clearInterval(timer);
        };
    }, []);

    const posters = [
        {
            imgLink: `/assets/lx/LauncherX_Poster.webp`,
            link: "https://afdian.com/a/launcherx",
            title: t("afdCardTitle"),
            description: t("afdCardDescription")
        },
        {
            imgLink: `/assets/lx/LauncherX_Poster_Main.webp`,
            link: "https://www.minebbs.com/resources/launcherx.7182/",
            title: t("minebbsCardTitle"),
            description: t("minebbsCardDescription")
        }
    ];

    const isPaid = useQuery({
        queryKey: ["isPaid"],
        queryFn: () => checkIsPaidImpl()
    });

    const verification = useQuery({
        queryKey: ["sponsorVerification"],
        enabled: isPaid.data === true,
        retry: false,
        queryFn: async () => {
            const authToken = await getStorageItemAsync(StoredAuthToken);
            if (!authToken) throw new Error(t("backendServerError"));
            const response = await getCurrentVerificationAsync(authToken);
            if (response.status === 204) return null;
            if (response.status !== 200 || !response.response) throw new Error(t("backendServerError"));
            return response.response;
        }
    });
    const verificationInfo = verification.data;
    const verificationExpired = isVerificationCodeExpired(verificationInfo?.verificationCodeExpiresAt, now);

    const copyAsync = async (value: string) => {
        await navigator.clipboard.writeText(value);
        await notify.success({
            title: t("copied"),
            content: value,
            placement: "top-right",
            duration: 2000,
            offset: Constants.NotificationOffset,
            attach: () => document
        });
    };

    const onSubmit: FormProps["onSubmit"] = (e) => {
        if (e.validateResult !== true) return;

        const formData = e.fields as FormData;

        setIsLoading(true);

        async function redeemAsyncImpl() {
            const authToken = await getStorageItemAsync(StoredAuthToken);

            if (!authToken) return;

            redeemAsync(formData.orderNumber!, authToken)
                .then(async (r) => {
                    if (!r || !r.status) throw new Error(t("backendServerError"));
                    if (r.status === 204) throw new Error(t("userAlreadySponsor"));
                    if (r.status === 400) throw new Error(t("backendServerError"));
                    if (r.status === 403) throw new Error(t("redeemAlreadyUsedOrInvalid"));
                    if (r.status === 404) throw new Error(t("userNotFound"));
                    if (!r.response) throw new Error(t("backendServerError"));

                    await notify.success({
                        title: t("sponsorThanks"),
                        content: t("sponsorThanksDescription"),
                        placement: "top-right",
                        duration: 3000,
                        offset: Constants.NotificationOffset,
                        closeBtn: true,
                        attach: () => document
                    });

                    setRecentlyRedeemed(true);
                    await isPaid.refetch();
                })
                .catch(async (err) => {
                    await notify.error({
                        title: t("failedToGetIsPaid"),
                        content: (err as Error).message,
                        placement: "top-right",
                        duration: 3000,
                        offset: Constants.NotificationOffset,
                        closeBtn: true,
                        attach: () => document
                    });
                })
                .finally(() => setIsLoading(false));
        }

        redeemAsyncImpl().then();
    };

    return (
        <>
            <div>
                {isPaid.error && (
                    <Alert
                        theme="error"
                        message={(isPaid.error as Error).message}
                        operation={
                            <Button variant="outline" onClick={() => void isPaid.refetch()}>
                                {t("retry")}
                            </Button>
                        }
                    />
                )}
                {!isPaid.data && (
                    <Alert
                        theme="info"
                        message={t("howToCheckSponsorOrderNumber")}
                        operation={
                            <a href={t("checkHereLink")} target="_blank">
                                {t("checkHere")}
                            </a>
                        }
                        close
                    />
                )}

                {isPaid.data && (
                    <section className="rounded-none border border-border bg-card p-5  border-border bg-card sm:p-8">
                        <div className="flex items-start gap-4">
                            <CheckCircleIcon size="32px" className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">{t("sponsorThanks")}</h2>
                                <p className="text-sm leading-6 text-muted-foreground text-muted-foreground">
                                    {t("sponsorThanksDescription")}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-border pt-6 border-border">
                            <div className="flex flex-wrap items-center gap-3">
                                <UsergroupIcon className="text-emerald-600 dark:text-emerald-400" />
                                <span className="font-medium">{t("sponsorInsiderGroupTitle")}</span>
                                <Button variant="outline" size="small" onClick={() => copyAsync("956810404")}>
                                    956810404 <CopyIcon className="ml-2" />
                                </Button>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground text-muted-foreground">
                                {t("sponsorInsiderGroupDescription")}
                            </p>
                        </div>

                        {verificationInfo && !verification.isError && (
                            <div className="mt-6 border-t border-border pt-6 border-border">
                                <h3 className="text-lg font-semibold">{t("sponsorQqVerificationTitle")}</h3>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground text-muted-foreground">
                                    {t("sponsorQqVerificationDescription")}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {verificationInfo.qqGroups.map((group) => (
                                        <Button key={group} variant="outline" onClick={() => copyAsync(group)}>
                                            QQ {group} <CopyIcon className="ml-2" />
                                        </Button>
                                    ))}
                                </div>
                                <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6">
                                    <li>{t("verificationStepJoin")}</li>
                                    <li>{t("verificationStepPrivateChat")}</li>
                                    <li>{t("verificationStepCommand")}</li>
                                </ol>
                                <button
                                    type="button"
                                    disabled={verificationExpired}
                                    className="mt-3 inline-flex max-w-full items-center rounded-none border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-left font-mono text-sm break-all text-emerald-700 disabled:opacity-50 dark:text-emerald-300"
                                    onClick={() =>
                                        copyAsync(
                                            `/verify ${verificationInfo.username} ${verificationInfo.verificationCode}`
                                        )
                                    }>
                                    /verify {verificationInfo.username} {verificationInfo.verificationCode}
                                    <CopyIcon className="ml-3 shrink-0" />
                                </button>
                                {verificationExpired && (
                                    <div className="mt-4">
                                        <Alert theme="warning" message={t("sponsorQqVerificationExpired")} />
                                    </div>
                                )}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button
                                        theme="primary"
                                        disabled={verificationExpired}
                                        onClick={() => verification.refetch()}>
                                        {t("sponsorQqVerificationDone")}
                                    </Button>
                                    <Button variant="outline" onClick={() => verification.refetch()}>
                                        {t("sponsorQqVerificationRefresh")}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {recentlyRedeemed && verification.isError && (
                            <div className="mt-6 border-t border-border pt-6 border-border">
                                <h3 className="text-lg font-semibold">{t("sponsorQqVerificationTitle")}</h3>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground text-muted-foreground">
                                    {t("sponsorQqVerificationLoginHint")}
                                </p>
                                <Button
                                    className="mt-4"
                                    theme="primary"
                                    onClick={async () => {
                                        await clearSessionAsync();
                                        navigate("/auth/login?redirect=/user/sponsor");
                                    }}>
                                    {t("sponsorQqVerificationLogin")}
                                </Button>
                            </div>
                        )}
                    </section>
                )}

                {isPaid.isLoading && (
                    <div className="p-[5%]">
                        <Loading />
                    </div>
                )}

                {!isPaid.isLoading && !isPaid.data && (
                    <div className="pt-12">
                        <Form className="max-w-[50vh]" onSubmit={onSubmit}>
                            <FormItem
                                label={t("afdOrderNumber")}
                                name="orderNumber"
                                rules={[
                                    { required: true, message: t("afdOrderNumberRequired"), type: "error" },
                                    { min: 23, message: t("afdOrderNumberRuleDescription"), type: "error" },
                                    { max: 30, message: t("afdOrderNumberRuleDescription"), type: "error" },
                                    {
                                        pattern: AfdOrderNumberPattern,
                                        message: t("afdOrderNumberRuleDescription"),
                                        type: "warning"
                                    }
                                ]}>
                                <Input disabled={isLoading} />
                            </FormItem>
                            <FormItem>
                                <Button loading={isLoading} theme="primary" type="submit" block>
                                    {t("submit")}
                                </Button>
                            </FormItem>
                        </Form>
                    </div>
                )}

                <Divider align="center" layout="horizontal" />

                <div>
                    <Row gutter={[16, 16]}>
                        {posters.map((post, i) => (
                            <Col sm={12} md={6} lg={4} key={i}>
                                <Card
                                    bordered
                                    theme="poster2"
                                    cover={post.imgLink}
                                    actions={
                                        <Button theme="primary" variant="base" href={post.link} target="_blank">
                                            {t("goto")}
                                        </Button>
                                    }
                                    footer={<Comment author={post.title} content={post.description}></Comment>}></Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </div>
        </>
    );
}

export const Component = () => UserSponsor();
