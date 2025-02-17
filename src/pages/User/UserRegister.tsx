import { useRef } from "react";
import { useNavigate } from "react-router";
import { KeyIcon, MailIcon, User1Icon } from "tdesign-icons-react";
import { Button, CustomValidator, Form, Input, InternalFormInstance } from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import { PasswordPattern, UsernamePattern } from "../../helpers/ValidationRules.ts";
import i18next from "../../i18n.ts";

const t = i18next.t;

function UserRegister() {
    const navigate = useNavigate();
    const form = useRef<InternalFormInstance>(null);

    const rePassword: CustomValidator = (val) =>
        new Promise((resolve) => {
            const timer = setTimeout(() => {
                resolve(form.current?.getFieldValue("confirmPassword") === val);
                clearTimeout(timer);
            });
        });

    return (
        <>
            <div className="p-8 space-y-4 bg-zinc-50/30 dark:bg-zinc-900/80 bg-opacity-25 rounded-2xl hover:shadow-lg active:shadow-md shadow transition">
                <h5>{t("register")}</h5>
                <Form
                    ref={form}
                    className="w-[300px] md:w-[400px] lg:w-[450px]"
                    statusIcon={true}
                    colon={true}
                    labelWidth={0}>
                    <FormItem
                        name="account"
                        rules={[
                            { required: true, message: t("emailRequired"), type: "error" },
                            { email: true, message: t("emailIncorrectMessage") }
                        ]}>
                        <Input clearable={true} prefixIcon={<MailIcon />} placeholder={t("pleaseInputEmail")} />
                    </FormItem>
                    <FormItem
                        name="username"
                        rules={[
                            { required: true, message: t("usernameRequired"), type: "error" },
                            { pattern: UsernamePattern, message: t("usernameRuleDescription"), type: "error" }
                        ]}>
                        <Input clearable={true} prefixIcon={<User1Icon />} placeholder={t("pleaseInputUserName")} />
                    </FormItem>
                    <FormItem
                        name="password"
                        rules={[
                            { required: true, message: t("passwordRequired"), type: "error" },
                            { pattern: PasswordPattern, message: t("passwordRuleDescription"), type: "error" }
                        ]}>
                        <Input
                            type="password"
                            prefixIcon={<KeyIcon />}
                            clearable={true}
                            placeholder={t("pleaseInputPassword")}
                        />
                    </FormItem>
                    <FormItem
                        name="comfirmPassword"
                        rules={[
                            { required: true, message: t("passwordRequired"), type: "error" },
                            { validator: rePassword, message: t("passwordIsNotSame") }
                        ]}>
                        <Input
                            type="password"
                            prefixIcon={<KeyIcon />}
                            clearable={true}
                            placeholder={t("confirmPassword")}
                        />
                    </FormItem>
                    <FormItem>
                        <Button theme="primary" type="submit" block>
                            {t("register")}
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
export const Component = () => UserRegister();
