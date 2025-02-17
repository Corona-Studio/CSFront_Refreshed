import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { LinkIcon, MoonIcon, SunnyIcon, ViewListIcon } from "tdesign-icons-react";
import { Button, Dropdown, DropdownOption, MenuValue } from "tdesign-react";
import HeadMenu from "tdesign-react/es/menu/HeadMenu";
import MenuItem from "tdesign-react/es/menu/MenuItem";

import logo from "../assets/logo.png";
import { useThemeDetector } from "../helpers/ThemeDetector.ts";
import i18next from "../i18n";
import styles from "./MenuBar.module.css";

const t = i18next.t;

interface MenuItemValue {
    to: string;
    isInSiteLink: boolean;
}

function MenuBar() {
    const themeDetector = useThemeDetector();
    const [active, setActive] = useState<MenuValue>("0");
    const [isDarkMode, setDarkMode] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    const linkOptions: DropdownOption[] = [
        {
            content: t("indexPage"),
            value: { to: "/", isInSiteLink: true }
        },
        {
            content: "LauncherX",
            value: { to: "/lx", isInSiteLink: true }
        },
        {
            content: "CMFS",
            value: { to: "/cmfs", isInSiteLink: true }
        },
        {
            content: t("cskb"),
            value: { to: "https://kb.corona.studio/", isInSiteLink: false }
        },
        {
            content: t("moreProjects"),
            value: { to: "https://github.com/Corona-Studio/", isInSiteLink: false }
        }
    ];

    function onMenuItemClicked(dropdownItem: DropdownOption) {
        if (!dropdownItem.value) return;

        const value = dropdownItem.value as MenuItemValue;

        if (value.isInSiteLink) {
            navigate(value.to);
            return;
        }

        window.open(value.to, "_blank");
    }

    const operations = () => (
        <div className="pr-8 flex">
            <Button
                variant="text"
                shape="square"
                icon={isDarkMode ? <MoonIcon /> : <SunnyIcon />}
                onClick={switchTheme}
            />
            <Dropdown
                direction="right"
                hideAfterItemClick={true}
                placement="bottom"
                trigger="hover"
                options={linkOptions}
                onClick={onMenuItemClicked}>
                <Button variant="text" shape="square" icon={<ViewListIcon />} />
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
        setActive("0");
    }

    return (
        <>
            <div className="fixed flex gap-1.5 top-0 w-screen z-1000 hover:shadow-lg active:shadow-md shadow transition">
                <HeadMenu
                    theme="light"
                    value={active}
                    onChange={(v) => setActive(v)}
                    logo={<img className={styles.menuLogo} src={logo} alt="logo" onClick={onLogoClicked} />}
                    operations={operations()}>
                    <MenuItem value={"/"} onClick={() => navigate("/")} className="invisible w-0 md:visible md:w-auto">
                        <span>{t("indexPage")}</span>
                    </MenuItem>
                    <MenuItem
                        value={"/lx"}
                        onClick={() => navigate("/lx")}
                        className="invisible w-0 md:visible md:w-auto">
                        <span>LauncherX</span>
                    </MenuItem>
                    <MenuItem
                        value={"/cmfs"}
                        onClick={() => navigate("/cmfs")}
                        className="invisible w-0 md:visible md:w-auto">
                        <span>CMFS</span>
                    </MenuItem>
                    <MenuItem
                        value={"cskb"}
                        href="https://kb.corona.studio/"
                        target="_blank"
                        className="invisible w-0 md:visible md:w-auto">
                        <span>
                            {t("cskb")}
                            <LinkIcon />
                        </span>
                    </MenuItem>
                    <MenuItem
                        value={"moreProj"}
                        href="https://github.com/Corona-Studio/"
                        target="_blank"
                        className="invisible w-0 md:visible md:w-auto">
                        <span>
                            {t("moreProjects")}
                            <LinkIcon />
                        </span>
                    </MenuItem>
                </HeadMenu>
            </div>
        </>
    );
}

export default MenuBar;
