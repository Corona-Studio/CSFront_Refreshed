"use client";
import localForage from "@/lib/storage";
import { KeyRound as KeyIcon, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
    Button,
    type FieldValidator,
    Form,
    type FormController,
    type FormProps,
    Input,
    Tooltip,
    notify
} from "../../components/marathon/index.tsx";
import { FormItem } from "../../components/marathon/index.tsx";
import Constants from "../../helpers/Constants.ts";
import { getSafeRedirect } from "../../helpers/RouteHelper.ts";
import { getCurrentPageTheme } from "../../helpers/ThemeDetector.ts";
import { useUrlQuery } from "../../helpers/UrlQueryHelper.ts";
import { PasswordPattern } from "../../helpers/ValidationRules.ts";
import { useNavigate } from "../../lib/navigation.ts";
import { StoredPasswordResetEmail, confirmPasswordResetAsync } from "../../requests/LxAuthRequests.ts";
import AllowedChars from "./AllowedChars.tsx";

interface FormData {
    email?: string;
    code?: string;
    password?: string;
    confirmPassword?: string;
}

function AuthResetPassword() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const query = useUrlQuery();
    const redirect = getSafeRedirect(query.get("redirect"), "/user");
    const [isLoading, setIsLoading] = useState(false);
    const [savedEmail, setSavedEmail] = useState<string>();
    const form = useRef<FormController>(null);

    useEffect(() => {
        localForage.getItem<string>(StoredPasswordResetEmail).then((email) => {
            if (email) setSavedEmail(email);
            form.current?.setFieldsValue({ email: email ?? "" });
        });
    }, []);

    const passwordsMatch: FieldValidator = async (value) => form.current?.getFieldValue("password") === value;

    const onSubmit: FormProps["onSubmit"] = (event) => {
        if (event.validateResult !== true) return;
        const data = event.fields as FormData;
        setIsLoading(true);

        confirmPasswordResetAsync({ email: data.email!, code: data.code!, newPassword: data.password! })
            .then(async (response) => {
                if (response.status === 401) throw new Error(t("invalidOrExpiredResetCode"));
                if (response.status === 400) throw new Error(t("passwordRuleDescription"));
                if (response.status !== 200) throw new Error(t("passwordResetFailedDescription"));

                await localForage.removeItem(StoredPasswordResetEmail);
                await notify.success({
                    title: t("passwordResetSucceeded"),
                    content: t("passwordResetSucceededDescription"),
                    placement: "top-right",
                    duration: 4000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });
                navigate(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
            })
            .catch(async (error) => {
                await notify.error({
                    title: t("passwordResetFailed"),
                    content: (error as Error).message,
                    placement: "top-right",
                    duration: 4000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div className="p-5 sm:p-8 space-y-4 bg-card rounded-none    transition">
            <h1 className="text-2xl leading-normal">{t("resetPassword")}</h1>
            <p className="max-w-[450px] text-sm text-muted-foreground">{t("passwordResetCodeDescription")}</p>
            <Form ref={form} className="w-full min-w-0" onSubmit={onSubmit}>
                <FormItem
                    name="email"
                    initialData={savedEmail}
                    rules={[
                        { required: true, message: t("userNameOrEmail"), type: "error" },
                        { whitespace: true, message: t("userNameOrEmail") }
                    ]}>
                    <Input
                        disabled={isLoading}
                        clearable
                        prefixIcon={<UserIcon />}
                        placeholder={t("userNameOrEmail")}
                    />
                </FormItem>
                <FormItem
                    name="code"
                    rules={[
                        { required: true, message: t("resetCodeRequired"), type: "error" },
                        { pattern: /^\d{6}$/, message: t("resetCodeRuleDescription"), type: "error" }
                    ]}>
                    <Input
                        disabled={isLoading}
                        clearable
                        maxlength={6}
                        prefixIcon={<KeyIcon />}
                        placeholder={t("pleaseInputResetCode")}
                    />
                </FormItem>
                <FormItem className="h-px! p-0! m-0!">
                    <div className="INTERNAL___WHERE_TOOLTIP_ATTACHES h-px! p-0! m-0!"></div>
                </FormItem>
                <Tooltip
                    zIndex={1000}
                    attach="div.INTERNAL___WHERE_TOOLTIP_ATTACHES"
                    content={<AllowedChars />}
                    trigger="focus"
                    theme={getCurrentPageTheme() ? "default" : "light"}
                    placement="top">
                    <FormItem
                        name="password"
                        rules={[
                            { required: true, message: t("passwordRequired"), type: "error" },
                            { pattern: PasswordPattern, message: t("passwordRuleDescription"), type: "error" }
                        ]}>
                        <Input
                            disabled={isLoading}
                            type="password"
                            prefixIcon={<KeyIcon />}
                            clearable
                            placeholder={t("pleaseInputPassword")}
                        />
                    </FormItem>
                </Tooltip>
                <FormItem
                    name="confirmPassword"
                    rules={[
                        { required: true, message: t("passwordRequired"), type: "error" },
                        { validator: passwordsMatch, message: t("passwordIsNotSame") }
                    ]}>
                    <Input
                        disabled={isLoading}
                        type="password"
                        prefixIcon={<KeyIcon />}
                        clearable
                        placeholder={t("confirmPassword")}
                    />
                </FormItem>
                <FormItem>
                    <Button loading={isLoading} theme="primary" type="submit" block>
                        {t("resetPassword")}
                    </Button>
                </FormItem>
            </Form>
        </div>
    );
}

export const Component = () => AuthResetPassword();
