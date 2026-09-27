import localForage from "localforage";
import { useState } from "react";
import { useNavigate } from "react-router";
import { MailIcon } from "tdesign-icons-react";
import { Button, Form, type FormProps, Input, NotificationPlugin } from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import { getSafeRedirect } from "../../helpers/RouteHelper.ts";
import { useUrlQuery } from "../../helpers/UrlQueryHelper.ts";
import i18next from "../../i18n.ts";
import {
    StoredPasswordResetEmail,
    requestPasswordResetAsync
} from "../../requests/LxAuthRequests.ts";
import Constants from "./../../helpers/Constants.ts";

const t = i18next.t;

interface FormData {
    email?: string;
}

function AuthForgetPassword() {
    const navigate = useNavigate();
    const query = useUrlQuery();
    const redirect = getSafeRedirect(query.get("redirect"), "/user");
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit: FormProps["onSubmit"] = (event) => {
        if (event.validateResult !== true) return;

        const email = (event.fields as FormData).email!;
        setIsLoading(true);
        requestPasswordResetAsync(email)
            .then(async (response) => {
                if (response.status !== 202) throw new Error(t("passwordResetRequestFailedDescription"));

                await localForage.setItem(StoredPasswordResetEmail, email);
                await NotificationPlugin.success({
                    title: t("passwordResetRequestAccepted"),
                    content: t("passwordResetRequestAcceptedDescription"),
                    placement: "top-right",
                    duration: 6000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });
                navigate(`/auth/resetPassword?redirect=${encodeURIComponent(redirect)}`);
            })
            .catch(async (error) => {
                await NotificationPlugin.error({
                    title: t("passwordResetRequestFailed"),
                    content: (error as Error).message,
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
        <div className="p-5 sm:p-8 space-y-4 bg-zinc-50/30 dark:bg-zinc-900/80 bg-opacity-25 rounded-2xl hover:shadow-lg active:shadow-md shadow transition">
            <h5>{t("forgetPassword")}</h5>
            <p className="max-w-[450px] text-sm text-zinc-600 dark:text-zinc-300">
                {t("passwordResetRequestDescription")}
            </p>
            <Form className="w-[300px] md:w-[400px] lg:w-[450px]" statusIcon colon labelWidth={0} onSubmit={onSubmit}>
                <FormItem
                    name="email"
                    rules={[
                        { required: true, message: t("emailRequired"), type: "error" },
                        { email: true, message: t("emailIncorrectMessage") }
                    ]}>
                    <Input disabled={isLoading} clearable prefixIcon={<MailIcon />} placeholder={t("pleaseInputEmail")} />
                </FormItem>
                <FormItem>
                    <Button loading={isLoading} theme="primary" type="submit" block>
                        {t("sendQqResetCode")}
                    </Button>
                    <Button
                        theme="default"
                        type="button"
                        style={{ marginLeft: 12 }}
                        onClick={() => navigate(`/auth/login?redirect=${encodeURIComponent(redirect)}`)}>
                        {t("login")}
                    </Button>
                </FormItem>
            </Form>
        </div>
    );
}

export const Component = () => AuthForgetPassword();
