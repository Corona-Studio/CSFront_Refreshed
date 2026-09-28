import localForage from "localforage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LockOnIcon, UserIcon } from "tdesign-icons-react";
import { Button, Checkbox, Form, Input, NotificationPlugin } from "tdesign-react";
import type { FormProps } from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import { getSafeRedirect } from "../../helpers/RouteHelper.ts";
import { clearSessionAsync, isUserSessionValidAsync, saveSessionAsync } from "../../helpers/SessionHelper.ts";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import { useUrlQuery } from "../../helpers/UrlQueryHelper.ts";
import i18next from "../../i18n.ts";
import {
    StoredAuthEmail,
    StoredAuthToken,
    StoredRegistrationVerification,
    loginAsync,
    startVerificationAsync
} from "../../requests/LxAuthRequests.ts";
import { checkUserIsPaidAsync } from "../../requests/LxUserRequests.ts";
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
    const [isOpeningPasswordReset, setIsOpeningPasswordReset] = useState(false);
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
            const token = await getStorageItemAsync(StoredAuthToken);
            const status = await checkUserIsPaidAsync(token ?? "");
            if (status?.status === 401 || status?.status === 403) {
                await clearSessionAsync();
                return;
            }
            if (status?.status !== 200) return;
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
                if (r.status === 403) {
                    const verification = await startVerificationAsync({
                        email: formData.email!,
                        password: formData.password!
                    });
                    if (verification.status !== 200 || !verification.response) throw new Error(t("accountNotVerified"));
                    await localForage.setItem(StoredRegistrationVerification, verification.response);
                    navigate(`/auth/register/complete?redirect=${encodeURIComponent(redirect)}`);
                    return;
                }
                if (!r.response) throw new Error(t("unknownLoginErrorDescription"));

                if (
                    r.response.verificationRequired &&
                    r.response.verificationCode &&
                    r.response.verificationCodeExpiresAt
                ) {
                    await localForage.setItem(StoredRegistrationVerification, {
                        username: r.response.username,
                        verificationCode: r.response.verificationCode,
                        verificationCodeExpiresAt: r.response.verificationCodeExpiresAt,
                        qqGroups: r.response.qqGroups ?? []
                    });
                    navigate(`/auth/register/complete?redirect=${encodeURIComponent(redirect)}`);
                    return;
                }

                await saveSessionAsync(r.response, r.response.email ?? formData.email!, formData.rememberMe);
                await localForage.removeItem(StoredRegistrationVerification);

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
                            { whitespace: true, message: t("emailRequired") }
                        ]}>
                        <Input
                            disabled={isLoading}
                            clearable={true}
                            prefixIcon={<UserIcon />}
                            placeholder={t("userNameOrEmail")}
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
                    <div className="flex items-center justify-between gap-3">
                        <FormItem name="rememberMe" className="mb-0!">
                            <Checkbox disabled={isLoading || isOpeningPasswordReset}>{t("rememberPassword")}</Checkbox>
                        </FormItem>
                        <Button
                            variant="text"
                            theme="primary"
                            type="button"
                            loading={isOpeningPasswordReset}
                            disabled={isLoading}
                            className="shrink-0"
                            onClick={() => {
                                setIsOpeningPasswordReset(true);
                                navigate(`/auth/forgetPassword?redirect=${encodeURIComponent(redirect)}`);
                            }}>
                            {t("forgetPassword")}
                        </Button>
                    </div>
                </Form>
            </div>
        </>
    );
}

// Must Keep for ReactRouter
export const Component = () => AuthLogin();
