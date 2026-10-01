"use client";
import localForage from "@/lib/storage";
import { User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Form, type FormProps, Input, notify } from "../../components/marathon/index.tsx";
import { FormItem } from "../../components/marathon/index.tsx";
import { getSafeRedirect } from "../../helpers/RouteHelper.ts";
import { useUrlQuery } from "../../helpers/UrlQueryHelper.ts";
import { useNavigate } from "../../lib/navigation.ts";
import { StoredPasswordResetEmail, requestPasswordResetAsync } from "../../requests/LxAuthRequests.ts";
import Constants from "./../../helpers/Constants.ts";

interface FormData {
    email?: string;
}

function AuthForgetPassword() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const query = useUrlQuery();
    const redirect = getSafeRedirect(query.get("redirect"), "/user");
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit: FormProps["onSubmit"] = (event) => {
        if (event.validateResult !== true) return;

        const identifier = (event.fields as FormData).email!;
        setIsLoading(true);
        requestPasswordResetAsync(identifier)
            .then(async (response) => {
                if (response.status !== 202) throw new Error(t("passwordResetRequestFailedDescription"));

                await localForage.setItem(StoredPasswordResetEmail, identifier);
                await notify.success({
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
                await notify.error({
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
        <div className="p-5 sm:p-8 space-y-4 bg-card bg-opacity-25 rounded-none    transition">
            <h1 className="!text-2xl !leading-normal">{t("forgetPassword")}</h1>
            <p className="max-w-[450px] text-sm text-muted-foreground text-muted-foreground">
                {t("passwordResetRequestDescription")}
            </p>
            <Form className="w-[300px] md:w-[400px] lg:w-[450px]" onSubmit={onSubmit}>
                <FormItem
                    name="email"
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
