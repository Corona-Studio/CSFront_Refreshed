import localForage from "localforage";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { KeyIcon, MailIcon } from "tdesign-icons-react";
import {
    Button,
    type CustomValidator,
    Form,
    type FormProps,
    Input,
    type InternalFormInstance,
    NotificationPlugin,
    Tooltip
} from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import Constants from "../../helpers/Constants.ts";
import { getSafeRedirect } from "../../helpers/RouteHelper.ts";
import { getCurrentPageTheme } from "../../helpers/ThemeDetector.ts";
import { useUrlQuery } from "../../helpers/UrlQueryHelper.ts";
import { PasswordPattern } from "../../helpers/ValidationRules.ts";
import i18next from "../../i18n.ts";
import {
    StoredPasswordResetEmail,
    confirmPasswordResetAsync
} from "../../requests/LxAuthRequests.ts";
import AllowedChars from "./AllowedChars.tsx";

const t = i18next.t;

interface FormData {
    email?: string;
    code?: string;
    password?: string;
    confirmPassword?: string;
}

function AuthResetPassword() {
    const navigate = useNavigate();
    const query = useUrlQuery();
    const redirect = getSafeRedirect(query.get("redirect"), "/user");
    const [isLoading, setIsLoading] = useState(false);
    const [savedEmail, setSavedEmail] = useState<string>();
    const form = useRef<InternalFormInstance>(null);

    useEffect(() => {
        localForage.getItem<string>(StoredPasswordResetEmail).then((email) => {
            if (email) setSavedEmail(email);
            form.current?.setFieldsValue({ email: email ?? "" });
        });
    }, []);

    const passwordsMatch: CustomValidator = async (value) => form.current?.getFieldValue("password") === value;

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
                await NotificationPlugin.success({
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
                await NotificationPlugin.error({
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
        <div className="p-5 sm:p-8 space-y-4 bg-zinc-50/30 dark:bg-zinc-900/80 bg-opacity-25 rounded-2xl hover:shadow-lg active:shadow-md shadow transition">
            <h5>{t("resetPassword")}</h5>
            <p className="max-w-[450px] text-sm text-zinc-600 dark:text-zinc-300">{t("passwordResetCodeDescription")}</p>
            <Form ref={form} className="w-[300px] md:w-[400px] lg:w-[450px]" statusIcon colon labelWidth={0} onSubmit={onSubmit}>
                <FormItem
                    name="email"
                    initialData={savedEmail}
                    rules={[
                        { required: true, message: t("emailRequired"), type: "error" },
                        { email: true, message: t("emailIncorrectMessage") }
                    ]}>
                    <Input disabled={isLoading} clearable prefixIcon={<MailIcon />} placeholder={t("pleaseInputEmail")} />
                </FormItem>
                <FormItem
                    name="code"
                    rules={[
                        { required: true, message: t("resetCodeRequired"), type: "error" },
                        { pattern: /^\d{6}$/, message: t("resetCodeRuleDescription"), type: "error" }
                    ]}>
                    <Input disabled={isLoading} clearable maxlength={6} prefixIcon={<KeyIcon />} placeholder={t("pleaseInputResetCode")} />
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
                        <Input disabled={isLoading} type="password" prefixIcon={<KeyIcon />} clearable placeholder={t("pleaseInputPassword")} />
                    </FormItem>
                </Tooltip>
                <FormItem
                    name="confirmPassword"
                    rules={[
                        { required: true, message: t("passwordRequired"), type: "error" },
                        { validator: passwordsMatch, message: t("passwordIsNotSame") }
                    ]}>
                    <Input disabled={isLoading} type="password" prefixIcon={<KeyIcon />} clearable placeholder={t("confirmPassword")} />
                </FormItem>
                <FormItem>
                    <Button loading={isLoading} theme="primary" type="submit" block>{t("resetPassword")}</Button>
                </FormItem>
            </Form>
        </div>
    );
}

export const Component = () => AuthResetPassword();
