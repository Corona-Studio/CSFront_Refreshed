import { memo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { EarthIcon, LinkIcon, MoonIcon, SunnyIcon, User1Icon, ViewListIcon } from "tdesign-icons-react";
import { Button, Dropdown, DropdownOption, MenuValue } from "tdesign-react";
import HeadMenu from "tdesign-react/es/menu/HeadMenu";
import MenuItem from "tdesign-react/es/menu/MenuItem";

import logo from "../assets/logo.png";
import { I18NLangKey } from "../helpers/StorageHelper.ts";
import { useThemeDetector } from "../helpers/ThemeDetector.ts";
import i18next from "../i18n";
import { MenuItemValue } from "../interfaces/MenuItemValue.ts";
import "./MenuBar.css";
import styles from "./MenuBar.module.css";

const t = i18next.t;

interface DropDownItemValue {
    content: string;
    value: MenuItemValue;
    menuValue: string;
}

function MenuBar() {
    const themeDetector = useThemeDetector();
    const [active, setActive] = useState<MenuValue>("0");
    const [isDarkMode, setDarkMode] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    const langCodeMapping: Map<string, string> = new Map([
        ["zhCN", "zh"],
        ["enUS", "en"]
    ]);

    const languageOptions = [
        {
            content: "简体中文",
            value: "zhCN"
        },
        {
            content: "English (US)",
            value: "enUS"
        }
    ];

    const linkOptions: DropDownItemValue[] = [
        {
            content: t("indexPage"),
            value: { to: "/", isInSiteLink: true },
            menuValue: "/"
        },
        {
            content: "LauncherX",
            value: { to: "/lx", isInSiteLink: true },
            menuValue: "/lx"
        },
        {
            content: "CMFS",
            value: { to: "/cmfs", isInSiteLink: true },
            menuValue: "/cmfs"
        },
        {
            content: t("cskb"),
            value: { to: "https://kb.corona.studio/", isInSiteLink: false },
            menuValue: "cskb"
        },
        {
            content: t("moreProjects"),
            value: { to: "https://github.com/Corona-Studio/", isInSiteLink: false },
            menuValue: "moreProj"
        }
    ];

    function to(value: MenuItemValue) {
        if (value.isInSiteLink) {
            navigate(value.to);
            return;
        }

        window.open(value.to, "_blank");
    }

    function onMenuItemClicked(dropdownItem: DropdownOption) {
        if (!dropdownItem.value) return;

        const value = dropdownItem.value as MenuItemValue;

        to(value);
    }

    // eslint-disable-next-line react-hooks/immutability
    document.documentElement.lang = langCodeMapping.get(i18next.language) ?? "zh";

    function onLanguageMenuItemClicked(dropdownItem: DropdownOption) {
        if (!dropdownItem.value) return;

        const value = dropdownItem.value as string;

        localStorage.setItem(I18NLangKey, value);

        i18next.changeLanguage(value ?? "zhCN").then(() => {
            window.location.reload();
        });
    }

    const operations = () => (
        <div className="flex-center ">
            <Button
                variant="text"
                shape="square"
                icon={isDarkMode ? <MoonIcon /> : <SunnyIcon />}
                onClick={switchTheme}
            />
            <Button variant="text" shape="square" icon={<User1Icon />} onClick={() => navigate("/auth/login")} />
            <Dropdown
                direction="right"
                hideAfterItemClick={true}
                placement="bottom"
                trigger="hover"
                options={languageOptions}
                onClick={onLanguageMenuItemClicked}>
                <Button variant="text" shape="square" className="flex" icon={<EarthIcon />} />
            </Dropdown>
            <Dropdown
                direction="right"
                hideAfterItemClick={true}
                placement="bottom"
                trigger="hover"
                options={linkOptions}
                onClick={onMenuItemClicked}>
                <Button variant="text" shape="square" className="flex lg:hidden!" icon={<ViewListIcon />} />
            </Dropdown>
        </div>
    );

    useEffect(() => {
        setDarkMode(!themeDetector);
        setActive(location.pathname);
    }, [location.pathname, themeDetector]);

    function switchTheme() {
        setDarkMode(!isDarkMode);

        localStorage.theme = isDarkMode ? "dark" : "light";
        if (isDarkMode) {
            document.documentElement.setAttribute("theme-mode", "dark");
            return;
        }
        document.documentElement.removeAttribute("theme-mode");
    }

    function onLogoClicked() {
        navigate("/");
    }

    return (
        <>
            <div className="fixed flex gap-1.5 top-0 w-screen z-1000 hover:shadow-lg active:shadow-md shadow transition">
                <HeadMenu
                    theme="light"
                    className="pl-2.5! pr-1! lg:px-5!"
                    value={active}
                    onChange={(v) => setActive(v)}
                    logo={<img className={`${styles.menuLogo} m-0!`} src={logo} alt="logo" onClick={onLogoClicked} />}
                    operations={operations()}>
                    <div className="hidden lg:flex">
                        {linkOptions.map((option, i) => (
                            <MenuItem key={i} value={option.menuValue} onClick={() => to(option.value)}>
                                <span>
                                    {option.content}
                                    {!option.value.isInSiteLink && <LinkIcon />}
                                </span>
                            </MenuItem>
                        ))}
                    </div>
                </HeadMenu>
            </div>
        </>
    );
}

export default memo(MenuBar);
