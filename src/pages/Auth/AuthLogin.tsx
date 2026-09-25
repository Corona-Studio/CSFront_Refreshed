import localForage from "localforage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LockOnIcon, MailIcon } from "tdesign-icons-react";
import { Button, Checkbox, Form, Input, NotificationPlugin } from "tdesign-react";
import type { FormProps } from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import { getSafeRedirect } from "../../helpers/RouteHelper.ts";
import { isUserSessionValidAsync, saveSessionAsync } from "../../helpers/SessionHelper.ts";
import { useUrlQuery } from "../../helpers/UrlQueryHelper.ts";
import i18next from "../../i18n.ts";
import { StoredAuthEmail, loginAsync } from "../../requests/LxAuthRequests.ts";
import Constants from "./../../helpers/Constants.ts";

const t = i18next.t;

interface FormData {
    email?: string;
    password?: string;
    rememberMe: boolean;
}

function AuthLogin() {
    const navigate = useNavigate();
    const query = useUrlQuery();

    const redirect = getSafeRedirect(query.get("redirect"), "/user");

    const [isLoading, setIsLoading] = useState(false);
    const [savedEmail, setSavedEmail] = useState<string | null>();

    const [form] = Form.useForm();

    useEffect(() => {
        async function setEmailAsync() {
            const email = await localForage.getItem<string>(StoredAuthEmail);
            setSavedEmail(email);

            form.reset();
        }

        setEmailAsync().then();
    }, [form]);

    // Check for login status
    useEffect(() => {
        async function checkAuthAsync() {
            if (!(await isUserSessionValidAsync())) return;
            navigate(redirect);
        }

        checkAuthAsync().then();
    }, [navigate, redirect]);

    const onSubmit: FormProps["onSubmit"] = (e) => {
        if (e.validateResult !== true) return;

        const formData = e.fields as FormData;

        setIsLoading(true);

        loginAsync({ email: formData.email!, password: formData.password! })
            .then(async (r) => {
                if (!r || !r.status) throw new Error(t("unknownLoginErrorDescription"));
                if (r.status === 401) throw new Error(t("incorrectEmailOrPassword"));
                if (!r.response) throw new Error(t("unknownLoginErrorDescription"));

                await saveSessionAsync(r.response, formData.email!, formData.rememberMe);

                await NotificationPlugin.success({
                    title: t("loginSucceeded"),
                    content: t("loginSucceededDescription"),
                    placement: "top-right",
                    duration: 3000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });

                navigate(redirect);
            })
            .catch(async (err) => {
                await NotificationPlugin.error({
                    title: t("loginFailed"),
                    content: (err as Error).message,
                    placement: "top-right",
                    duration: 3000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <>
            <div className="p-5 sm:p-8 space-y-4 bg-zinc-50/30 dark:bg-zinc-900/80 bg-opacity-25 rounded-2xl hover:shadow-lg active:shadow-md shadow transition">
                <h5>{t("login")}</h5>
                <Form
                    resetType="initial"
                    form={form}
                    className="w-[300px] md:w-[400px] lg:w-[450px]"
                    statusIcon={true}
                    colon={true}
                    labelWidth={0}
                    onSubmit={onSubmit}>
                    <FormItem
                        name="email"
                        initialData={savedEmail}
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
                    <FormItem name="password">
                        <Input
                            disabled={isLoading}
                            type="password"
                            prefixIcon={<LockOnIcon />}
                            clearable={true}
                            placeholder={t("pleaseInputPassword")}
                        />
                        <Button
                            theme="danger"
                            type="reset"
                            style={{ marginLeft: 12 }}
                            onClick={() => navigate(`/auth/forgetPassword?redirect=${encodeURIComponent(redirect)}`)}>
                            {t("forgetPassword")}
                        </Button>
                    </FormItem>
                    <FormItem>
                        <Button theme="primary" type="submit" loading={isLoading} block>
                            {t("login")}
                        </Button>
                        <Button
                            theme="default"
                            type="reset"
                            style={{ marginLeft: 12 }}
                            onClick={() =>
                                navigate(redirect ? `/auth/register?redirect=${redirect}` : "/auth/register")
                            }>
                            {t("register")}
                        </Button>
                    </FormItem>
                    <FormItem name="rememberMe">
                        <Checkbox disabled={isLoading}>{t("rememberPassword")}</Checkbox>
                    </FormItem>
                </Form>
            </div>
        </>
    );
}

// Must Keep for ReactRouter
export const Component = () => AuthLogin();
