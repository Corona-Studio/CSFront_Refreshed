import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Loading, NotificationPlugin, Space } from "tdesign-react";

import { verifyEmail } from "../../helpers/EmailVerificationHelper.ts";
import { useUrlQuery } from "../../helpers/UrlQueryHelper.ts";
import i18next from "../../i18n.ts";

const t = i18next.t;

function AuthConfirmEmail() {
    const navigate = useNavigate();
    const query = useUrlQuery();

    const queryToken = query.get("token");
    const queryEmail = query.get("email");
    const queryVerifyFor = query.get("verifyFor");

    const [isLoading, setIsLoading] = useState(true);
    const [isFaulted, setIsFaulted] = useState(false);

    useEffect(() => {
        if (queryToken && queryEmail && queryVerifyFor) return;

        NotificationPlugin.error({
            title: t("emailVerificationFailed"),
            content: t("emailVerificationFailedDescription"),
            placement: "top-right",
            duration: 10000,
            offset: [-36, "5rem"],
            closeBtn: true,
            attach: () => document
        }).then(() => {});

        setTimeout(() => {
            navigate("/");
        }, 3000);
    }, [navigate, queryToken, queryEmail, queryVerifyFor]);

    useEffect(() => {
        if (!queryToken || !queryEmail || !queryVerifyFor) return;

        verifyEmail(
            queryToken!,
            queryEmail!,
            "none",
            queryVerifyFor!,
            "/auth/login",
            navigate,
            setIsLoading,
            setIsFaulted
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryToken, queryEmail, queryVerifyFor]);

    return (
        <>
            <div className="p-8 space-y-4 bg-zinc-50/30 dark:bg-zinc-900/80 bg-opacity-25 rounded-2xl hover:shadow-lg active:shadow-md shadow transition">
                <h5>{t("confirmEmail")}</h5>

                {isLoading && (
                    <Space size={24} align="center">
                        <Loading indicator loading preventScrollThrough showOverlay />
                        <p>{(t("confirmEmailDetail") as string).replace("{}", query.get("email") ?? "-")}</p>
                    </Space>
                )}

                {!isLoading && !isFaulted && <p>{t("emailVerifiedDescription")}</p>}

                {!isLoading && isFaulted && <p>{t("emailVerificationFailed")}</p>}
            </div>
        </>
    );
}

// Must Keep for ReactRouter
export const Component = () => AuthConfirmEmail();
