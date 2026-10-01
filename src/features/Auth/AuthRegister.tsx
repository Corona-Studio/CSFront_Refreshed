"use client";
import localForage from "@/lib/storage";
import { KeyRound as KeyIcon, User as User1Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
    Button,
    FieldValidator,
    Form,
    FormController,
    type FormProps,
    Input,
    Tooltip,
    notify
} from "../../components/marathon/index.tsx";
import { FormItem } from "../../components/marathon/index.tsx";
import { getSafeRedirect } from "../../helpers/RouteHelper.ts";
import { getCurrentPageTheme } from "../../helpers/ThemeDetector.ts";
import { useUrlQuery } from "../../helpers/UrlQueryHelper.ts";
import { PasswordPattern, UsernamePattern } from "../../helpers/ValidationRules.ts";
import { useNavigate } from "../../lib/navigation.ts";
import { StoredAuthEmail, registerAsync } from "../../requests/LxAuthRequests.ts";
import Constants from "./../../helpers/Constants.ts";
import AllowedChars from "./AllowedChars.tsx";
import layout from "./AuthFormLayout.module.css";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

interface TurnstileApi {
    render: (container: HTMLElement, options: Record<string, unknown>) => string;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
}

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

interface FormData {
    password?: string;
    confirmPassword?: string;
    username?: string;
}

function AuthRegister() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const query = useUrlQuery();

    const redirect = getSafeRedirect(query.get("redirect"), "/user");

    const form = useRef<FormController>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");
    const [turnstileLoadFailed, setTurnstileLoadFailed] = useState(false);
    const turnstileContainer = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);

    useEffect(() => {
        if (!siteKey || !turnstileContainer.current) return;
        const container = turnstileContainer.current;
        let disposed = false;
        const renderWidget = () => {
            if (disposed || !window.turnstile) return;
            widgetId.current = window.turnstile.render(container, {
                sitekey: siteKey,
                action: "register",
                size: "flexible",
                callback: (token: string) => setTurnstileToken(token),
                "expired-callback": () => setTurnstileToken(""),
                "error-callback": () => setTurnstileToken("")
            });
        };
        const script = document.createElement("script");
        if (window.turnstile) {
            renderWidget();
        } else {
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
            script.async = true;
            script.onload = renderWidget;
            script.onerror = () => setTurnstileLoadFailed(true);
            document.head.appendChild(script);
        }
        return () => {
            disposed = true;
            script.remove();
            if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
            widgetId.current = null;
        };
    }, []);

    const rePassword: FieldValidator = async (value) => form.current?.getFieldValue("password") === value;

    const onSubmit: FormProps["onSubmit"] = (e) => {
        if (e.validateResult !== true) return;
        if (!turnstileToken) return;

        const formData = e.fields as FormData;

        setIsLoading(true);

        registerAsync({ password: formData.password!, username: formData.username!, turnstileToken })
            .then(async (r) => {
                if (!r || !r.status) throw new Error(t("backendServerError"));
                if (r.status === 400) throw new Error(t("turnstileFailed"));
                if (r.status === 403) throw new Error(t("usernameUsed"));
                if (!r.response) throw new Error(t("unknownLoginErrorDescription"));
                if (!r.response.succeeded) throw new Error(JSON.stringify(r.response.errors));

                await localForage.setItem(StoredAuthEmail, formData.username!);
                await notify.success({
                    title: t("registerSucceeded"),
                    content: t("registerSucceededDescription"),
                    placement: "top-right",
                    duration: 3000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });

                navigate(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
            })
            .catch(async (err) => {
                await notify.error({
                    title: t("registerFailed"),
                    content: (err as Error).message,
                    placement: "top-right",
                    duration: 3000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });
            })
            .finally(() => {
                setIsLoading(false);
                setTurnstileToken("");
                if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
            });
    };

    return (
        <>
            <div className="w-[calc(100vw-2rem)] max-w-[520px] rounded-none bg-card p-5  transition   bg-card sm:p-8">
                <h1 className={`${layout.title} !text-2xl !leading-normal`}>{t("register")}</h1>
                <Form ref={form} onSubmit={onSubmit} className="w-full min-w-0">
                    <FormItem
                        name="username"
                        className={layout.field}
                        rules={[
                            { required: true, message: t("usernameRequired"), type: "error" },
                            { pattern: UsernamePattern, message: t("usernameRuleDescription"), type: "error" }
                        ]}>
                        <Input
                            className="INTERNAL___WHERE_TOOLTIP_ATTACHES"
                            disabled={isLoading}
                            clearable={true}
                            prefixIcon={<User1Icon />}
                            placeholder={t("pleaseInputUserName")}
                        />
                    </FormItem>
                    <Tooltip
                        attach="div.INTERNAL___WHERE_TOOLTIP_ATTACHES"
                        content={<AllowedChars />}
                        trigger="focus"
                        theme={getCurrentPageTheme() ? "default" : "light"}
                        placement="bottom"
                        overlayClassName="-translate-y-[48px] md:-translate-y-[24px]">
                        <FormItem
                            name="password"
                            className={layout.field}
                            rules={[
                                { required: true, message: t("passwordRequired"), type: "error" },
                                { pattern: PasswordPattern, message: t("passwordRuleDescription"), type: "error" }
                            ]}>
                            <Input
                                name="password"
                                disabled={isLoading}
                                type="password"
                                prefixIcon={<KeyIcon />}
                                clearable={true}
                                placeholder={t("pleaseInputPassword")}
                            />
                        </FormItem>
                    </Tooltip>

                    <FormItem
                        name="confirmPassword"
                        className={layout.field}
                        rules={[
                            { required: true, message: t("passwordRequired"), type: "error" },
                            { validator: rePassword, message: t("passwordIsNotSame") }
                        ]}>
                        <Input
                            disabled={isLoading}
                            type="password"
                            prefixIcon={<KeyIcon />}
                            clearable={true}
                            placeholder={t("confirmPassword")}
                        />
                    </FormItem>
                    <div className={layout.turnstile}>
                        <div ref={turnstileContainer} className="w-full min-w-0" />
                        {(!siteKey || turnstileLoadFailed) && (
                            <p className="mt-2 text-sm text-destructive">{t("turnstileUnavailable")}</p>
                        )}
                    </div>
                    <div className={layout.actions}>
                        <Button
                            className="min-w-0 flex-1"
                            loading={isLoading}
                            disabled={!turnstileToken}
                            theme="primary"
                            type="submit"
                            block>
                            {t("register")}
                        </Button>
                        <Button
                            className="shrink-0"
                            theme="default"
                            type="reset"
                            onClick={() => navigate(`/auth/login?redirect=${encodeURIComponent(redirect)}`)}>
                            {t("login")}
                        </Button>
                    </div>
                </Form>
            </div>
        </>
    );
}

export const Component = () => AuthRegister();
