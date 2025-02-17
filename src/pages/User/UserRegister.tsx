import { useNavigate } from "react-router";
import { KeyIcon, MailIcon, User1Icon } from "tdesign-icons-react";
import { Button, Form, Input } from "tdesign-react";
import FormItem from "tdesign-react/es/form/FormItem";

import i18next from "../../i18n.ts";

import { checkPasswd } from "../../helpers/common.ts";
import { useRef, useState } from "react";


const t = i18next.t;


function UserRegister() {

    let _passBuffer = "",
        [tips, setTips] = useState("");

    let passwd, confirm;

    // // 1
    // let [anything, setAnything] = useState('');
    // // changing value
    // setAnything("new value");
    // // getting value
    // anything;

    // // 2
    // let thing = new DoubleBind();
    // // changing value
    // thing.set("new value");
    // // getting value
    // thing.value;

    function handlePasswd(e: string, inBuffer = false){
        e = e.trim();
        if(inBuffer) _passBuffer = e;
        if(e !== "") setTips(`${e}: ${checkPasswd(e)}`);
        
    }

    const navigate = useNavigate();
    passwd = useRef(null);
    confirm = useRef(null);

    return (
        <>
            <div className="p-8 space-y-4 bg-zinc-50/30 dark:bg-zinc-900/80 bg-opacity-25 rounded-2xl hover:shadow-lg active:shadow-md shadow transition">
                <h5>{t("register")}</h5>
                <Form className="w-[300px] md:w-[400px] lg:w-[450px]" statusIcon={true} colon={true} labelWidth={0}>
                    <FormItem name="account">
                        <Input clearable={true} prefixIcon={<MailIcon />} placeholder={t("pleaseInputEmail")} />
                    </FormItem>
                    <FormItem name="username">
                        <Input clearable={true} prefixIcon={<User1Icon />} placeholder={t("pleaseInputUserName")} />
                    </FormItem>
                    <FormItem name="password">
                        <Input
                            ref={passwd}
                            type="password"
                            prefixIcon={<KeyIcon />}
                            clearable={true}
                            placeholder={t("pleaseInputPassword")}
                            onChange={(e) => handlePasswd(e, true)}
                        />
                    </FormItem>
                    <FormItem name="comfirmPassword">
                        <Input
                            ref={confirm}
                            type="password"
                            prefixIcon={<KeyIcon />}
                            clearable={true}
                            placeholder={t("confirmPassword")}
                            tips={tips}

                            onChange={(e) => handlePasswd(e, false)}
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
