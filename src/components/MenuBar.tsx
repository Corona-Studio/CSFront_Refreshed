"use client";
import { Button, Dropdown } from "@/components/marathon";
import { I18NLangKey } from "@/helpers/StorageHelper";
import { setTheme, useThemePreference } from "@/helpers/ThemeDetector";
import { ArrowUpRight, Globe, Menu, Monitor, Moon, Sun, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

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
    return (
        <header className="sticky top-0 z-50 h-[72px] border-b border-border bg-background/95 backdrop-blur-md">
            <div className="flex items-center justify-between h-full px-4 md:px-8 gap-3 md:gap-4">
                <Link
                    href="/"
                    aria-label="Corona Studio 首页"
                    className="group relative shrink-0 py-2 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-8 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none">
                    <Image
                        src="/assets/logo.png"
                        alt="Corona Studio"
                        width={1235}
                        height={345}
                        sizes="(max-width: 360px) 100px, (max-width: 640px) 136px, 180px"
                        preload
                        className="h-auto w-[136px] max-[360px]:w-[100px] sm:w-[180px] object-contain invert dark:invert-0 transition-opacity group-hover:opacity-80 motion-reduce:transition-none"
                    />
                </Link>
                <nav aria-label="主导航" className="hidden lg:flex h-full">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            target={link.href.startsWith("https") ? "_blank" : undefined}
                            rel={link.href.startsWith("https") ? "noopener noreferrer" : undefined}
                            aria-current={
                                path === link.href || (link.href !== "/" && path.startsWith(link.href))
                                    ? "page"
                                    : undefined
                            }
                            className="flex items-center gap-1 px-5 border-l border-border text-xs uppercase tracking-wide hover:bg-muted aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground">
                            {link.label}
                            {link.href.startsWith("https") && <ArrowUpRight className="size-3" />}
                        </Link>
                    ))}
                </nav>
                <div className="flex items-center gap-1">
                    <Dropdown
                        options={[
                            { content: t("themeLight"), value: "light" },
                            { content: t("themeDark"), value: "dark" },
                            { content: t("themeSystem"), value: "system" }
                        ]}
                        onClick={(o) => {
                            if (o.value === "light" || o.value === "dark" || o.value === "system") setTheme(o.value);
                        }}>
                        <Button theme="default" variant="text" shape="square" aria-label={t("themeSettings")}>
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
                        <Button theme="default" variant="text" shape="square" aria-label="语言 / Language">
                            <Globe className="size-4" />
                        </Button>
                    </Dropdown>
                    <Link href="/user" aria-label={t("userCenter")} className="p-3 hover:bg-muted">
                        <User className="size-4" />
                    </Link>
                    <div className="lg:hidden">
                        <Dropdown
                            options={links.map((l) => ({
                                content: (
                                    <Link className="block w-full" href={l.href}>
                                        {l.label}
                                    </Link>
                                ),
                                value: l.href
                            }))}>
                            <Button theme="default" variant="text" shape="square" aria-label="导航菜单">
                                <Menu className="size-4" />
                            </Button>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </header>
    );
}
