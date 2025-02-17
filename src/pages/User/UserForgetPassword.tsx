import { useNavigate } from "react-router";
import { MailIcon } from "tdesign-icons-react";
import { Button, Form, Input } from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import i18next from "../../i18n.ts";

const t = i18next.t;

function UserForgetPassword() {
    const navigate = useNavigate();

    return (
        <>
            <div className="p-8 space-y-4 bg-zinc-50/30 dark:bg-zinc-900/80 bg-opacity-25 rounded-2xl hover:shadow-lg active:shadow-md shadow transition">
                <h5>{t("forgetPassword")}</h5>
                <Form className="w-[300px] md:w-[400px] lg:w-[450px]" statusIcon={true} colon={true} labelWidth={0}>
                    <FormItem name="account">
                        <Input clearable={true} prefixIcon={<MailIcon />} placeholder={t("pleaseInputEmail")} />
                    </FormItem>
                    <FormItem>
                        <Button theme="primary" type="submit" block>
                            {t("submit")}
                        </Button>
                        <Button
                            theme="default"
                            type="reset"
                            style={{ marginLeft: 12 }}
                            onClick={() => navigate("/user/login")}>
                            {t("login")}
                        </Button>
                    </FormItem>
                </Form>
            </div>
        </>
    );
}

// Must Keep for ReactRouter
export const Component = () => UserForgetPassword();
