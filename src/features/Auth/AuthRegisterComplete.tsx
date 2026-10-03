"use client";
import localForage from "@/lib/storage";
import { CircleCheck as CheckCircleIcon, Copy as CopyIcon, Users as UsergroupIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, notify } from "../../components/marathon/index.tsx";
import { getSafeRedirect } from "../../helpers/RouteHelper.ts";
import { useUrlQuery } from "../../helpers/UrlQueryHelper.ts";
import { isVerificationCodeExpired } from "../../helpers/VerificationHelper.ts";
import { useNavigate } from "../../lib/navigation.ts";
import { type RegistrationVerificationInfo, StoredRegistrationVerification } from "../../requests/LxAuthRequests.ts";
import Constants from "./../../helpers/Constants.ts";

function AuthRegisterComplete() {
    const { t } = useTranslation();
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
        await notify.success({
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
        <div className="p-5 sm:p-8 space-y-6 bg-card rounded-none  w-full min-w-0">
            <div className="flex items-center gap-3">
                <CheckCircleIcon size="32px" className="text-success" />
                <div>
                    <h1 className="text-2xl leading-normal">{t("registrationComplete")}</h1>
                    <p className="text-sm opacity-70">{t("verificationRequired")}</p>
                </div>
            </div>

            {verification && !expired ? (
                <>
                    <section className="space-y-2 text-center">
                        <p className="text-sm opacity-70">{t("yourVerificationCode")}</p>
                        <button
                            type="button"
                            className="w-full rounded-none border border-blue-400/40 bg-blue-500/10 px-5 py-4 font-mono text-3xl font-bold tracking-[0.35em] text-blue-600 dark:text-blue-300"
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
                            {t("verificationStepCommand")}{" "}
                            <code>
                                /verify {verification.username} {verification.verificationCode}
                            </code>
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
            {expired && (
                <Button block onClick={() => navigate(`/auth/login?redirect=${encodeURIComponent(redirect)}`)}>
                    {t("requestNewVerificationCode")}
                </Button>
            )}
        </div>
    );
}

export const Component = () => AuthRegisterComplete();
