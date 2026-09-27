import localForage from "localforage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircleIcon, CopyIcon, UsergroupIcon } from "tdesign-icons-react";
import { Button, NotificationPlugin } from "tdesign-react";

import { getSafeRedirect } from "../../helpers/RouteHelper.ts";
import { useUrlQuery } from "../../helpers/UrlQueryHelper.ts";
import { isVerificationCodeExpired } from "../../helpers/VerificationHelper.ts";
import i18next from "../../i18n.ts";
import {
    type RegistrationVerificationInfo,
    StoredRegistrationVerification
} from "../../requests/LxAuthRequests.ts";
import Constants from "./../../helpers/Constants.ts";

const t = i18next.t;

function AuthRegisterComplete() {
    const navigate = useNavigate();
    const query = useUrlQuery();
    const redirect = getSafeRedirect(query.get("redirect"), "/user");
    const [verification, setVerification] = useState<RegistrationVerificationInfo | null>();
    const [now, setNow] = useState(0);

    useEffect(() => {
        localForage.getItem<RegistrationVerificationInfo>(StoredRegistrationVerification).then(setVerification);
        const initialTimer = window.setTimeout(() => setNow(Date.now()), 0);
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => {
            window.clearTimeout(initialTimer);
            window.clearInterval(timer);
        };
    }, []);

    const expired = isVerificationCodeExpired(verification?.verificationCodeExpiresAt, now);

    const copyAsync = async (value: string) => {
        await navigator.clipboard.writeText(value);
        await NotificationPlugin.success({
            title: t("copied"),
            content: value,
            placement: "top-right",
            duration: 2000,
            offset: Constants.NotificationOffset,
            attach: () => document
        });
    };

    if (verification === undefined || now === 0) return null;

    return (
        <div className="p-5 sm:p-8 space-y-6 bg-zinc-50/50 dark:bg-zinc-900/80 rounded-2xl shadow-lg w-[330px] md:w-[520px]">
            <div className="flex items-center gap-3">
                <CheckCircleIcon size="32px" className="text-green-500" />
                <div>
                    <h5>{t("registrationComplete")}</h5>
                    <p className="text-sm opacity-70">{t("verificationRequired")}</p>
                </div>
            </div>

            {verification && !expired ? (
                <>
                    <section className="space-y-2 text-center">
                        <p className="text-sm opacity-70">{t("yourVerificationCode")}</p>
                        <button
                            type="button"
                            className="w-full rounded-xl border border-blue-400/40 bg-blue-500/10 px-5 py-4 font-mono text-3xl font-bold tracking-[0.35em] text-blue-600 dark:text-blue-300"
                            onClick={() => copyAsync(verification.verificationCode)}>
                            {verification.verificationCode}
                            <CopyIcon className="ml-3" />
                        </button>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center gap-2 font-medium">
                            <UsergroupIcon />
                            <span>{t("joinQqGroup")}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {verification.qqGroups.map((group) => (
                                <Button key={group} variant="outline" onClick={() => copyAsync(group)}>
                                    QQ {group} <CopyIcon className="ml-2" />
                                </Button>
                            ))}
                        </div>
                    </section>

                    <ol className="list-decimal space-y-2 pl-5 text-sm leading-6">
                        <li>{t("verificationStepJoin")}</li>
                        <li>{t("verificationStepPrivateChat")}</li>
                        <li>
                            {t("verificationStepCommand")} <code>/verify {verification.username} {verification.verificationCode}</code>
                        </li>
                    </ol>
                </>
            ) : (
                <p>{verification ? t("verificationCodeExpired") : t("verificationInfoMissing")}</p>
            )}

            <Button
                theme="primary"
                block
                disabled={!verification || expired}
                onClick={() => navigate(`/auth/login?redirect=${encodeURIComponent(redirect)}`)}>
                {t("verifiedGoLogin")}
            </Button>
            {expired && <Button block onClick={() => navigate(`/auth/login?redirect=${encodeURIComponent(redirect)}`)}>
                {t("requestNewVerificationCode")}
            </Button>}
        </div>
    );
}

export const Component = () => AuthRegisterComplete();
