import { DesktopIcon, LockOnIcon } from "tdesign-icons-react";
import { Button, Form, Input } from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import i18next from "../../i18n.ts";

const t = i18next.t;

function UserLogin() {
    return (
        <>
            <div className="p-8 space-y-4 bg-zinc-50/30 bg-opacity-20 dark:bg-zinc-900 bg-opacity-25 rounded-2xl hover:shadow-lg active:shadow-md shadow transition">
                <h4>{t("login")}</h4>
                <Form className="w-[300px] md:w-[400px] lg:w-[450px]" statusIcon={true} colon={true} labelWidth={0}>
                    <FormItem name="account">
                        <Input clearable={true} prefixIcon={<DesktopIcon />} placeholder="请输入账户名" />
                    </FormItem>
                    <FormItem name="password">
                        <Input type="password" prefixIcon={<LockOnIcon />} clearable={true} placeholder="请输入密码" />
                    </FormItem>
                    <FormItem>
                        <Button theme="primary" type="submit" block>
                            登录
                        </Button>
                    </FormItem>
                </Form>
            </div>
        </>
    );
}

// Must Keep for ReactRouter
export const Component = () => UserLogin();
