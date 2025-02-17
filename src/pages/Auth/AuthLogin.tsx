import { useNavigate } from "react-router";
import { LockOnIcon, MailIcon } from "tdesign-icons-react";
import { Button, Checkbox, Form, Input } from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import i18next from "../../i18n.ts";

const t = i18next.t;

function AuthLogin() {
    const navigate = useNavigate();

    return (
        <>
            <div className="p-8 space-y-4 bg-zinc-50/30 dark:bg-zinc-900/80 bg-opacity-25 rounded-2xl hover:shadow-lg active:shadow-md shadow transition">
                <h5>{t("login")}</h5>
                <Form className="w-[300px] md:w-[400px] lg:w-[450px]" statusIcon={true} colon={true} labelWidth={0}>
                    <FormItem
                        name="email"
                        rules={[
                            { required: true, message: t("emailRequired"), type: "error" },
                            { email: true, message: t("emailIncorrectMessage") }
                        ]}>
                        <Input clearable={true} prefixIcon={<MailIcon />} placeholder={t("pleaseInputEmail")} />
                    </FormItem>
                    <FormItem name="password">
                        <Input
                            type="password"
                            prefixIcon={<LockOnIcon />}
                            clearable={true}
                            placeholder={t("pleaseInputPassword")}
                        />
                        <Button
                            theme="danger"
                            type="reset"
                            style={{ marginLeft: 12 }}
                            onClick={() => navigate("/auth/forgetPassword")}>
                            {t("forgetPassword")}
                        </Button>
                    </FormItem>
                    <FormItem>
                        <Button theme="primary" type="submit" block>
                            {t("login")}
                        </Button>
                        <Button
                            theme="default"
                            type="reset"
                            style={{ marginLeft: 12 }}
                            onClick={() => navigate("/auth/register")}>
                            {t("register")}
                        </Button>
                    </FormItem>
                    <FormItem>
                        <Checkbox value="1">{t("rememberPassword")}</Checkbox>
                    </FormItem>
                </Form>
            </div>
        </>
    );
}

// Must Keep for ReactRouter
export const Component = () => AuthLogin();
