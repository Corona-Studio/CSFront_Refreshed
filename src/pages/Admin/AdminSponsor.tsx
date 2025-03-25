import { t } from "i18next";
import { useState } from "react";
import { MailIcon } from "tdesign-icons-react";
import {
    Alert,
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Divider,
    Form,
    type FormProps,
    Input,
    NotificationPlugin,
    Row
} from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import { UserSponsorInfo, querySponsorInfoAsync, setUserAsSponsorAsync } from "../../requests/AdminRequests.ts";
import { lxBackendUrl } from "../../requests/ApiConstants.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";

interface FormData {
    email?: string;
}

function AdminSponsor() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [userInfo, setUserInfo] = useState<UserSponsorInfo | undefined>(undefined);

    const onQuerySponsorSubmit: FormProps["onSubmit"] = (e) => {
        if (e.validateResult !== true) return;

        const formData = e.fields as FormData;

        setError(undefined);
        setIsLoading(true);

        async function querySponsorInfoImplAsync() {
            const authToken = await getStorageItemAsync(StoredAuthToken);

            if (!authToken) return;

            querySponsorInfoAsync(authToken, formData.email!)
                .then(async (r) => {
                    if (!r || !r.status) throw new Error(t("backendServerError"));
                    if (r.status === 404) throw new Error(t("userNotFound"));
                    if (!r.response) throw new Error(t("backendServerError"));

                    setUserInfo(r.response);
                })
                .catch(async (err) => {
                    setError((err as Error).message);
                })
                .finally(() => setIsLoading(false));
        }

        querySponsorInfoImplAsync().then();
    };

    const onSetSponsorSubmit: FormProps["onSubmit"] = (e) => {
        if (e.validateResult !== true) return;

        const formData = e.fields as FormData;

        setIsLoading(true);

        async function setUserAsSponsorImplAsync() {
            const authToken = await getStorageItemAsync(StoredAuthToken);

            if (!authToken) return;

            setUserAsSponsorAsync(authToken, formData.email!)
                .then(async (r) => {
                    if (!r || !r.status) throw new Error(t("backendServerError"));
                    if (r.status === 400) throw new Error(t("userAlreadySponsor"));
                    if (r.status === 404) throw new Error(t("userNotFound"));
                    if (!r.response) throw new Error(t("backendServerError"));

                    await NotificationPlugin.success({
                        title: t("setSponsorSucceeded"),
                        content: t("setSponsorSucceededDescription"),
                        placement: "top-right",
                        duration: 3000,
                        offset: [-36, "5rem"],
                        closeBtn: true,
                        attach: () => document
                    });
                })
                .catch(async (err) => {
                    await NotificationPlugin.error({
                        title: t("setSponsorFailed"),
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

        setUserAsSponsorImplAsync().then();
    };

    return (
        <>
            <div>
                <Row gutter={[16, 16]}>
                    <Col span={12} sm={12} md={6}>
                        <Card title={t("querySponsorInfo")} subtitle={t("querySponsorInfoDescription")}>
                            <Form statusIcon={true} colon={true} labelWidth={0} onSubmit={onQuerySponsorSubmit}>
                                <FormItem
                                    name="email"
                                    rules={[
                                        { required: true, message: t("emailRequired"), type: "error" },
                                        { email: true, message: t("emailIncorrectMessage") }
                                    ]}>
                                    <Input
                                        disabled={isLoading}
                                        clearable={true}
                                        prefixIcon={<MailIcon />}
                                        placeholder={t("pleaseInputEmail")}
                                    />
                                </FormItem>
                                <FormItem>
                                    <Button loading={isLoading} theme="primary" type="submit" block>
                                        {t("query")}
                                    </Button>
                                </FormItem>
                            </Form>
                        </Card>
                    </Col>
                    <Col span={12} sm={12} md={6}>
                        <Card title={t("setUserAsSponsor")} subtitle={t("setUserAsSponsorDescription")}>
                            <Form statusIcon={true} colon={true} labelWidth={0} onSubmit={onSetSponsorSubmit}>
                                <FormItem
                                    name="email"
                                    rules={[
                                        { required: true, message: t("emailRequired"), type: "error" },
                                        { email: true, message: t("emailIncorrectMessage") }
                                    ]}>
                                    <Input
                                        clearable={true}
                                        prefixIcon={<MailIcon />}
                                        placeholder={t("pleaseInputEmail")}
                                    />
                                </FormItem>
                                <FormItem>
                                    <Button loading={isLoading} theme="danger" type="submit" block>
                                        {t("submit")}
                                    </Button>
                                </FormItem>
                            </Form>
                        </Card>
                    </Col>
                </Row>

                {error && (
                    <div className="mt-8">
                        <Alert theme="error" message={error} />
                    </div>
                )}

                {userInfo && (
                    <div>
                        <Divider align="center" layout="horizontal" />
                        <Card title={t("queriedSponsorInfo")}>
                            <Row align="middle" gutter={12}>
                                <Col>
                                    <Avatar
                                        image={`${lxBackendUrl}/Avatar/${userInfo.id}`}
                                        shape="round"
                                        size="120px"
                                    />
                                </Col>
                                <Col>
                                    <Col>
                                        <h5>{userInfo.userName}</h5>
                                    </Col>
                                    <Col>
                                        <span>{userInfo.id}</span>
                                    </Col>
                                    <Col>
                                        <span>{userInfo.email}</span>
                                    </Col>
                                    <Col>
                                        <Badge
                                            count={t(userInfo.isPaid ? "isPaid" : "notPay")}
                                            shape="circle"
                                            size="medium"
                                            color={userInfo.isPaid ? "green" : "yellow"}
                                        />
                                    </Col>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}

// Must Keep for ReactRouter
export const Component = () => AdminSponsor();
