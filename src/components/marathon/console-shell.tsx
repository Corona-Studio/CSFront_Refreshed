"use client";
import { isAdminSessionValidAsync, isUserSessionValidAsync } from "@/helpers/SessionHelper";
import { Bell, Coins, GitCommitHorizontal, House, Image, Layers, MonitorSmartphone, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import styles from "./console-shell.module.css";
import { Loading } from "./layout";

export default function ConsoleShell({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
    const path = usePathname();
    const search = useSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    const [canManage, setCanManage] = useState(false);
    const [verifiedPath, setVerifiedPath] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        const validate = admin ? isAdminSessionValidAsync(false) : isUserSessionValidAsync();
        void validate
            .then(async (valid) => {
                if (cancelled) return;
                if (valid) {
                    setVerifiedPath(path);
                    if (!admin) {
                        const canAccess = await isAdminSessionValidAsync(false);
                        if (!cancelled) setCanManage(canAccess);
                    }
                } else if (admin && (await isUserSessionValidAsync())) {
                    if (!cancelled) router.replace("/user");
                } else
                    router.replace(
                        `/auth/login?redirect=${encodeURIComponent(path + (search.size ? `?${search.toString()}` : ""))}`
                    );
            })
            .catch(() => {
                if (!cancelled) router.replace("/auth/login");
            });
        return () => {
            cancelled = true;
        };
    }, [admin, path, router, search]);
    const root = admin ? "/admin" : "/user";
    const links = admin
        ? ([
              ["", t("adminCenter"), House],
              ["/users", t("userManagement"), Users],
              ["/sponsor", t("sponsorAdmin"), Coins],
              ["/builds", t("buildManagement"), Layers],
              ["/notifications", t("notificationManagement"), Bell],
              ["/contributions", t("contributionManagement"), GitCommitHorizontal]
          ] as const)
        : ([
              ["", t("userCenter"), House],
              ["/avatar", t("changeAvatar"), Image],
              ["/device", t("deviceManage"), MonitorSmartphone],
              ["/sponsor", t("sponsor"), Coins]
          ] as const);
    const active = links.find(([suffix]) => (suffix ? path.startsWith(root + suffix) : path === root));
    // Do not mount protected children or issue their queries before validation.
    if (verifiedPath !== path)
        return (
            <div className="m-container py-20">
                <Loading text="验证会话 / VERIFYING SESSION" />
            </div>
        );
    return (
        <div className={styles.console}>
            <aside className={styles.sidebar}>
                <nav aria-label={admin ? "管理导航" : "用户导航"}>
                    <p className="m-kicker px-3 mb-6">{admin ? "CS / ADMIN CONTROL" : "CS / PERSONAL SPACE"}</p>
                    {links.map(([suffix, title, Icon]) => (
                        <Link
                            key={suffix}
                            href={root + suffix}
                            aria-current={active?.[0] === suffix ? "page" : undefined}>
                            <Icon className="size-4" />
                            {title}
                        </Link>
                    ))}
                    {!admin && canManage && (
                        <Link href="/admin">
                            <Layers className="size-4" />
                            {t("adminCenter")}
                        </Link>
                    )}
                </nav>
            </aside>
            <div className={styles.consoleMain}>
                <div className={styles.consoleHeading}>
                    <div>
                        <p className="m-kicker mb-3">{admin ? "CONTROL / OPERATIONS" : "ACCOUNT / OPERATIONS"}</p>
                        <h1>{path.startsWith("/admin/contributions/") ? t("contributionReview") : active?.[1]}</h1>
                    </div>
                    <span className="m-kicker hidden sm:block">CORONA STUDIO</span>
                </div>
                {children}
            </div>
        </div>
    );
}
