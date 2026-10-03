"use client";
import ProgressiveBlur from "@/components/motion/progressive-blur";
import { Button, Dropdown } from "@/components/marathon";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { I18NLangKey } from "@/helpers/StorageHelper";
import { setTheme, useThemePreference } from "@/helpers/ThemeDetector";
import { ArrowUpRight, Globe, Menu, Monitor, Moon, Sun, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import styles from "./MenuBar.module.css";

export default function MenuBar() {
    const path = usePathname();
    const { t, i18n } = useTranslation();
    const preference = useThemePreference();
    const links = [
        { href: "/", label: t("indexPage") },
        { href: "/lx", label: "LauncherX" },
        { href: "/cmfs", label: "CMFS" },
        { href: "https://kb.corona.studio/", label: "CSKB" },
        { href: "https://github.com/Corona-Studio", label: t("moreProjects") }
    ];
    const isCurrent = (href: string) => path === href || (href !== "/" && path.startsWith(`${href}/`));
    return (
        <header className={styles.header}>
            <ProgressiveBlur className={styles.progressiveBlur} />
            <div className={styles.inner}>
                <Link href="/" aria-label="Corona Studio 首页" className={`${styles.brand} group`}>
                    <Image
                        src="/assets/logo.png"
                        alt="Corona Studio"
                        width={1235}
                        height={345}
                        sizes="(max-width: 360px) 100px, (max-width: 640px) 136px, 180px"
                        preload
                        className="block h-auto w-[136px] max-[360px]:w-[100px] sm:w-[180px] object-contain invert dark:invert-0 transition-opacity group-hover:opacity-80 motion-reduce:transition-none"
                    />
                </Link>
                <nav aria-label="主导航" className={styles.navigation}>
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            target={link.href.startsWith("https") ? "_blank" : undefined}
                            rel={link.href.startsWith("https") ? "noopener noreferrer" : undefined}
                            aria-current={isCurrent(link.href) ? "page" : undefined}
                            className={styles.navLink}>
                            {link.label}
                            {link.href.startsWith("https") && <ArrowUpRight className="size-3" />}
                        </Link>
                    ))}
                </nav>
                <div className={styles.tools}>
                    <Dropdown
                        options={[
                            { content: t("themeLight"), value: "light" },
                            { content: t("themeDark"), value: "dark" },
                            { content: t("themeSystem"), value: "system" }
                        ]}
                        onClick={(o) => {
                            if (o.value === "light" || o.value === "dark" || o.value === "system") setTheme(o.value);
                        }}>
                        <Button
                            theme="default"
                            variant="text"
                            shape="square"
                            className={styles.tool}
                            aria-label={t("themeSettings")}>
                            {preference === "dark" ? (
                                <Moon className="size-4" />
                            ) : preference === "light" ? (
                                <Sun className="size-4" />
                            ) : (
                                <Monitor className="size-4" />
                            )}
                        </Button>
                    </Dropdown>
                    <Dropdown
                        options={[
                            { content: "简体中文", value: "zhCN" },
                            { content: "English", value: "enUS" }
                        ]}
                        onClick={(o) => {
                            const lang = String(o.value);
                            localStorage.setItem(I18NLangKey, lang);
                            void i18n.changeLanguage(lang);
                        }}>
                        <Button
                            theme="default"
                            variant="text"
                            shape="square"
                            className={styles.tool}
                            aria-label="语言 / Language">
                            <Globe className="size-4" />
                        </Button>
                    </Dropdown>
                    <Link
                        href="/user"
                        aria-label={t("userCenter")}
                        className={styles.tool}
                        aria-current={isCurrent("/user") ? "page" : undefined}>
                        <User className="size-4" />
                    </Link>
                    <div className={styles.mobileMenu}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    theme="default"
                                    variant="text"
                                    shape="square"
                                    className={styles.tool}
                                    aria-label="导航菜单">
                                    <Menu className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={12} className="w-64 rounded-none p-2">
                                {links.map((link, index) => (
                                    <DropdownMenuItem key={link.href} asChild className={styles.mobileLink}>
                                        <Link
                                            href={link.href}
                                            aria-current={isCurrent(link.href) ? "page" : undefined}
                                            target={link.href.startsWith("https") ? "_blank" : undefined}
                                            rel={link.href.startsWith("https") ? "noopener noreferrer" : undefined}>
                                            <span className={styles.linkNumber} aria-hidden="true">
                                                0{index + 1}
                                            </span>
                                            {link.label}
                                            {link.href.startsWith("https") && (
                                                <ArrowUpRight className="ml-auto size-3.5" />
                                            )}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}
