import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { KeyIcon } from "tdesign-icons-react";
import {
    Button,
    CustomValidator,
    Form,
    type FormProps,
    Input,
    InternalFormInstance,
    NotificationPlugin,
    Tooltip
} from "tdesign-react";
import Constants from "./../../helpers/Constants.ts";
import FormItem from "tdesign-react/es/form/FormItem";

import { verifyEmail } from "../../helpers/EmailVerificationHelper.ts";
import { useUrlQuery } from "../../helpers/UrlQueryHelper.ts";
import { PasswordPattern } from "../../helpers/ValidationRules.ts";
import i18next from "../../i18n.ts";
import AllowedChars from "./AllowedChars.tsx";
import { getCurrentPageTheme } from "../../helpers/ThemeDetector.ts";

const t = i18next.t;

interface FormData {
    password?: string;
    confirmPassword?: string;
}

function AuthResetPassword() {
    const navigate = useNavigate();
    const query = useUrlQuery();

    const queryToken = query.get("token");
    const queryEmail = query.get("email");
    const queryVerifyFor = query.get("verifyFor");

    const [isLoading, setIsLoading] = useState(false);
    const [isFaulted, setIsFaulted] = useState(false);

    const tooltip = useRef(null);
    const form = useRef<InternalFormInstance>(null);

    useEffect(() => {
        if (queryToken && queryEmail && queryVerifyFor) return;

        NotificationPlugin.error({
            title: t("resetPasswordLinkInvalid"),
            content: t("resetPasswordLinkInvalidDescription"),
            placement: "top-right",
            duration: 10000,
            offset: Constants.NotificationOffset,
            closeBtn: true,
            attach: () => document
        }).then(() => { });

        setTimeout(() => {
            navigate("/");
        }, 300000);
    }, [navigate, queryToken, queryEmail, queryVerifyFor]);

    const rePassword: CustomValidator = (val) =>
        new Promise((resolve) => {
            const timer = setTimeout(() => {
                resolve(form.current?.getFieldValue("password") === val);
                clearTimeout(timer);
            });
        });

    const onSubmit: FormProps["onSubmit"] = (e) => {
        if (!queryToken || !queryEmail || !queryVerifyFor) return;
        if (e.validateResult !== true) return;

        const formData = e.fields as FormData;

        setIsLoading(true);

        verifyEmail(
            queryToken!,
            queryEmail!,
            formData.password!,
            queryVerifyFor!,
            "/auth/login",
            navigate,
            setIsLoading,
            setIsFaulted
        );
    };

    return (
        <>
            <div className="p-5 sm:p-8 space-y-4 bg-zinc-50/30 dark:bg-zinc-900/80 bg-opacity-25 rounded-2xl hover:shadow-lg active:shadow-md shadow transition">
                <h5>{t("forgetPassword")}</h5>
                <Form
                    ref={form}
                    className="w-[300px] md:w-[400px] lg:w-[450px]"
                    statusIcon={true}
                    colon={true}
                    labelWidth={0}
                    onSubmit={onSubmit}>
                    <FormItem className="h-px! p-0! m-0!">
                        <div className="INTERNAL___WHERE_TOOLTIP_ATTACHES h-px! p-0! m-0!"></div>
                    </FormItem>
                    <Tooltip zIndex={1000} ref={tooltip} attach="div.INTERNAL___WHERE_TOOLTIP_ATTACHES" content={<AllowedChars />}
                        trigger="focus" theme={getCurrentPageTheme() ? "default" : "light"} placement="top" overlayClassName="-translate-y-[108px] md:-translate-y-[78px]" >
                        <FormItem
                            name="password"
                            rules={[
                                { required: true, message: t("passwordRequired"), type: "error" },
                                { pattern: PasswordPattern, message: t("passwordRuleDescription"), type: "error" }
                            ]}>
                            <Input
                                onFocus={() => {
                                    (tooltip.current! as any).setVisible(true); // eslint-disable-line
                                }}
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
                    <FormItem>
                        <Button loading={isLoading} disabled={isFaulted} theme="primary" type="submit" block>
                            {t("resetPassword")}
                        </Button>
                    </FormItem>
                </Form>
            </div>
        </>
    );
}

// Must Keep for ReactRouter
export const Component = () => AuthResetPassword();
