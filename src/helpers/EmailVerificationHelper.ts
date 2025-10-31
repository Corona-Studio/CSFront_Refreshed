import { Dispatch, SetStateAction } from "react";
import { NavigateFunction } from "react-router";
import { NotificationPlugin } from "tdesign-react";

import i18next from "../i18n.ts";
import { emailVerifyAsync } from "../requests/LxAuthRequests.ts";
import Constants from "./Constants.ts";

const t = i18next.t;

export function verifyEmail(
    code: string,
    email: string,
    val: string,
    verifyFor: string,
    navigateUrl: string,
    navigate: NavigateFunction,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
    setIsFaulted: Dispatch<SetStateAction<boolean>>
) {
    setIsLoading(true);

    emailVerifyAsync(code!, email!, val!, verifyFor!)
        .then(async (r) => {
            if (!r || !r.status) throw new Error(t("backendServerError"));
            if (r.status === 401) throw new Error(t("emailVerificationExpired"));
            if (r.status === 404) throw new Error(t("emailVerificationNotFound"));
            if (!r.response) throw new Error(t("backendServerError"));

            await NotificationPlugin.success({
                title: t("emailVerified"),
                content: t("emailVerifiedDescription"),
                placement: "top-right",
                duration: 3000,
                offset: Constants.NotificationOffset,
                closeBtn: true,
                attach: () => document
            });

            navigate(navigateUrl);
        })
        .catch(async (err) => {
            setIsFaulted(true);
            await NotificationPlugin.error({
                title: t("emailVerificationFailed"),
                content: (err as Error).message,
                placement: "top-right",
                duration: 3000,
                offset: Constants.NotificationOffset,
                closeBtn: true,
                attach: () => document
            });
        })
        .finally(() => setIsLoading(false));
}
