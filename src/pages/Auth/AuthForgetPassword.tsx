import { useState } from "react";
import { useNavigate } from "react-router";
import { MailIcon } from "tdesign-icons-react";
import { Button, Form, type FormProps, Input, NotificationPlugin } from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import { useUrlQuery } from "../../helpers/UrlQueryHelper.ts";
import i18next from "../../i18n.ts";
import { forgePasswordAsync } from "../../requests/LxAuthRequests.ts";

const t = i18next.t;

interface FormData {
    email?: string;
}

function AuthForgetPassword() {
    const navigate = useNavigate();
    const query = useUrlQuery();

    const redirect = query.get("redirect");

    const [isLoading, setIsLoading] = useState(false);

    const onSubmit: FormProps["onSubmit"] = (e) => {
        if (e.validateResult !== true) return;

        const formData = e.fields as FormData;

        setIsLoading(true);

        forgePasswordAsync(formData.email!)
            .then(async (r) => {
                if (!r || !r.status) throw new Error(t("backendServerError"));
                if (r.status !== 200) throw new Error(t("forgetPasswordReqFailed"));
                if (!r.response) throw new Error(t("forgetPasswordReqFailed"));

                await NotificationPlugin.success({
                    title: t("forgetPasswordReqSucceeded"),
                    content: t("forgetPasswordReqSucceededDescription"),
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
                    title: t("forgetPasswordReqFailed"),
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
            <div className="p-5 sm:p-8 space-y-4 bg-zinc-50/30 dark:bg-zinc-900/80 bg-opacity-25 rounded-2xl hover:shadow-lg active:shadow-md shadow transition">
                <h5>{t("forgetPassword")}</h5>
                <Form
                    className="w-[300px] md:w-[400px] lg:w-[450px]"
                    statusIcon={true}
                    colon={true}
                    labelWidth={0}
                    onSubmit={onSubmit}>
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
                    <FormItem>
                        <Button loading={isLoading} theme="primary" type="submit" block>
                            {t("submit")}
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
export const Component = () => AuthForgetPassword();
