"use client";
import localForage from "@/lib/storage";
import { LockKeyhole as LockOnIcon, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Checkbox, Form, Input, notify } from "../../components/marathon/index.tsx";
import type { FormProps } from "../../components/marathon/index.tsx";
import { FormItem } from "../../components/marathon/index.tsx";
import { getSafeRedirect } from "../../helpers/RouteHelper.ts";
import { clearSessionAsync, isUserSessionValidAsync, saveSessionAsync } from "../../helpers/SessionHelper.ts";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import { useUrlQuery } from "../../helpers/UrlQueryHelper.ts";
import { useNavigate } from "../../lib/navigation.ts";
import {
    StoredAuthEmail,
    StoredAuthToken,
    StoredRegistrationVerification,
    loginAsync,
    startVerificationAsync
} from "../../requests/LxAuthRequests.ts";
import { checkUserIsPaidAsync } from "../../requests/LxUserRequests.ts";
import Constants from "./../../helpers/Constants.ts";
import layout from "./AuthFormLayout.module.css";

interface FormData {
    email?: string;
    password?: string;
    rememberMe?: boolean;
}

function AuthLogin() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const query = useUrlQuery();

    const redirect = getSafeRedirect(query.get("redirect"), "/user");

    const [isLoading, setIsLoading] = useState(false);
    const [isOpeningPasswordReset, setIsOpeningPasswordReset] = useState(false);
    const [savedEmail, setSavedEmail] = useState<string | null>();

    useEffect(() => {
        async function setEmailAsync() {
            const email = await localForage.getItem<string>(StoredAuthEmail);
            setSavedEmail(email);
        }

        setEmailAsync().then();
    }, []);

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
                if (r.status === 423) throw new Error(t("loginBannedDescription"));
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

                await saveSessionAsync(r.response, r.response.email ?? formData.email!, Boolean(formData.rememberMe));
                await localForage.removeItem(StoredRegistrationVerification);

                await notify.success({
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
                await notify.error({
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
            <div className="p-5 sm:p-8 bg-card bg-opacity-25 rounded-none    transition">
                <h1 className={`${layout.title} !text-2xl !leading-normal`}>{t("login")}</h1>
                <Form className="w-[300px] md:w-[400px] lg:w-[450px]" onSubmit={onSubmit}>
                    <FormItem
                        name="email"
                        className={layout.field}
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
                    <FormItem
                        name="password"
                        className={layout.field}
                        rules={[{ required: true, message: t("passwordRequired") }]}>
                        <Input
                            disabled={isLoading}
                            type="password"
                            prefixIcon={<LockOnIcon />}
                            clearable={true}
                            placeholder={t("pleaseInputPassword")}
                        />
                    </FormItem>
                    <div className={layout.actions}>
                        <Button theme="primary" type="submit" loading={isLoading} className="min-w-0 flex-1" block>
                            {t("login")}
                        </Button>
                        <Button
                            theme="default"
                            type="reset"
                            className="shrink-0"
                            onClick={() =>
                                navigate(redirect ? `/auth/register?redirect=${redirect}` : "/auth/register")
                            }>
                            {t("register")}
                        </Button>
                    </div>
                    <div className={layout.options}>
                        <FormItem name="rememberMe" className={layout.optionField}>
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

export const Component = () => AuthLogin();
