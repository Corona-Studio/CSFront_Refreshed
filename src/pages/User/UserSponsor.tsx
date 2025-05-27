import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
    NotificationPlugin,
    Row,
    Space
} from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import { checkIsPaidImpl } from "../../helpers/PaymentHelper.ts";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import { AfdOrderNumberPattern } from "../../helpers/ValidationRules.ts";
import i18next from "../../i18n.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import { redeemAsync } from "../../requests/LxUserRequests.ts";

const t = i18next.t;

interface FormData {
    orderNumber?: string;
}

function UserSponsor() {
    const [isLoading, setIsLoading] = useState(false);

    const posters = [
        {
            imgLink: new URL(`../../assets/lx/LauncherX_Poster.webp`, import.meta.url).href,
            link: "https://afdian.com/a/launcherx",
            title: t("afdCardTitle"),
            description: t("afdCardDescription")
        },
        {
            imgLink: new URL(`../../assets/lx/LauncherX_Poster_Main.webp`, import.meta.url).href,
            link: "https://www.minebbs.com/resources/launcherx.7182/",
            title: t("minebbsCardTitle"),
            description: t("minebbsCardDescription")
        }
    ];

    const isPaid = useQuery({
        queryKey: ["isPaid"],
        queryFn: () => checkIsPaidImpl()
    });

    if (isPaid.error) {
        NotificationPlugin.error({
            title: t("failedToGetIsPaid"),
            content: (isPaid.error as Error).message,
            placement: "top-right",
            duration: 3000,
            offset: [-36, "5rem"],
            closeBtn: true,
            attach: () => document
        }).then(() => {});
    }

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

                    await NotificationPlugin.success({
                        title: t("sponsorThanks"),
                        content: t("sponsorThanksDescription"),
                        placement: "top-right",
                        duration: 3000,
                        offset: [-36, "5rem"],
                        closeBtn: true,
                        attach: () => document
                    });

                    await isPaid.refetch();
                })
                .catch(async (err) => {
                    await NotificationPlugin.error({
                        title: t("failedToGetIsPaid"),
                        content: (err as Error).message,
                        placement: "top-right",
                        duration: 3000,
                        offset: [-36, "5rem"],
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
                <Space direction="vertical" className="w-full">
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
                    {isPaid.data && <Alert theme="success" message={t("sponsorThanksDescription")} />}
                    {isPaid.data && <Alert theme="success" message={t("sponsorThanksDescription2")} />}
                </Space>

                {isPaid.isLoading && (
                    <div className="p-[5%]">
                        <Loading />
                    </div>
                )}

                {!isPaid.isLoading && !isPaid.data && (
                    <div className="pt-12">
                        <Form
                            className="max-w-[50vh]"
                            statusIcon={true}
                            colon={true}
                            labelWidth={0}
                            onSubmit={onSubmit}>
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

// Must Keep for ReactRouter
export const Component = () => UserSponsor();
