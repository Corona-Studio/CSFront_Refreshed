import localForage from "localforage";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { KeyIcon, MailIcon, User1Icon } from "tdesign-icons-react";
import {
    Button,
    CustomValidator,
    Form,
    type FormProps,
    Input,
    InternalFormInstance,
    NotificationPlugin
} from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import { useUrlQuery } from "../../helpers/UrlQueryHelper.ts";
import { PasswordPattern, UsernamePattern } from "../../helpers/ValidationRules.ts";
import i18next from "../../i18n.ts";
import { StoredAuthEmail, StoredAuthPassword, registerAsync } from "../../requests/LxAuthRequests.ts";

const t = i18next.t;

interface FormData {
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
}

function AuthRegister() {
    const navigate = useNavigate();
    const query = useUrlQuery();

    const redirect = query.get("redirect");

    const form = useRef<InternalFormInstance>(null);

    const [isLoading, setIsLoading] = useState(false);

    const rePassword: CustomValidator = (val) =>
        new Promise((resolve) => {
            const timer = setTimeout(() => {
                resolve(form.current?.getFieldValue("confirmPassword") === val);
                clearTimeout(timer);
            });
        });

    const onSubmit: FormProps["onSubmit"] = (e) => {
        if (e.validateResult !== true) return;

        const formData = e.fields as FormData;

        setIsLoading(true);

        registerAsync({ email: formData.email!, password: formData.password!, username: formData.username! })
            .then(async (r) => {
                if (!r || !r.status) throw new Error(t("backendServerError"));
                if (r.status === 400) throw new Error(t("backendServerError"));
                if (r.status === 403) throw new Error(t("emailOrUsernameUsed"));
                if (!r.response) throw new Error(t("unknownLoginErrorDescription"));
                if (!r.response.succeeded) throw new Error(JSON.stringify(r.response.errors));

                localForage.setItem(StoredAuthEmail, formData.email!);
                localForage.setItem(StoredAuthPassword, formData.password!);

                await NotificationPlugin.success({
                    title: t("registerSucceeded"),
                    content: t("registerSucceededDescription"),
                    placement: "top-right",
                    duration: 3000,
                    offset: [-36, "5rem"],
                    closeBtn: true,
                    attach: () => document
                });

                navigate(redirect ? `/auth/login?redirect=${redirect}` : "/auth/login");
            })
            .catch(async (err) => {
                await NotificationPlugin.error({
                    title: t("registerFailed"),
                    content: (err as Error).message,
                    placement: "top-right",
                    duration: 3000,
                    offset: [-36, "5rem"],
                    closeBtn: true,
                    attach: () => document
                });
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <>
            <div className="p-8 space-y-4 bg-zinc-50/30 dark:bg-zinc-900/80 bg-opacity-25 rounded-2xl hover:shadow-lg active:shadow-md shadow transition">
                <h5>{t("register")}</h5>
                <Form
                    ref={form}
                    onSubmit={onSubmit}
                    className="w-[300px] md:w-[400px] lg:w-[450px]"
                    statusIcon={true}
                    colon={true}
                    labelWidth={0}>
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
                    <FormItem
                        name="username"
                        rules={[
                            { required: true, message: t("usernameRequired"), type: "error" },
                            { pattern: UsernamePattern, message: t("usernameRuleDescription"), type: "error" }
                        ]}>
                        <Input
                            disabled={isLoading}
                            clearable={true}
                            prefixIcon={<User1Icon />}
                            placeholder={t("pleaseInputUserName")}
                        />
                    </FormItem>
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
                            clearable={true}
                            placeholder={t("pleaseInputPassword")}
                        />
                    </FormItem>
                    <FormItem
                        name="confirmPassword"
                        rules={[
                            { required: true, message: t("afdOrderNumberRequired"), type: "error" },
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
                        <Button loading={isLoading} theme="primary" type="submit" block>
                            {t("register")}
                        </Button>
                        <Button
                            theme="default"
                            type="reset"
                            style={{ marginLeft: 12 }}
                            onClick={() => navigate(redirect ? `/auth/login?redirect=${redirect}` : "/auth/login")}>
                            {t("login")}
                        </Button>
                    </FormItem>
                </Form>
            </div>
        </>
    );
}

// Must Keep for ReactRouter
export const Component = () => AuthRegister();
