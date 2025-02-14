import "./MenuBar.css";
import { redirect } from "react-router";
import { Button, MenuValue } from "tdesign-react";
import { SunnyIcon, MoonIcon } from "tdesign-icons-react";
import HeadMenu from "tdesign-react/es/menu/HeadMenu";
import { useState } from "react";
import MenuItem from "tdesign-react/es/menu/MenuItem";
import logo from "../assets/logo.png";
import i18next from "../i18n";

function MenuBar() {
    const [active, setActive] = useState<MenuValue>("0");
    const [isDarkMode, setDarkMode] = useState(true);

    const operations = () => (
        <div>
            <Button
                variant="text"
                shape="square"
                icon={isDarkMode ? <MoonIcon /> : <SunnyIcon />}
                onClick={switchTheme}
            />
        </div>
    );

    function switchTheme() {
        setDarkMode(!isDarkMode);

        if (isDarkMode) {
            document.documentElement.classList.add("dark");
            document.documentElement.setAttribute("theme-mode", "dark");
            return;
        }

        document.documentElement.classList.remove("dark");
        document.documentElement.removeAttribute("theme-mode");
    }

    return (
        <>
            <div className="fixed flex gap-1.5 top-0 w-screen z-30 hover:shadow-lg active:shadow transition">
                <HeadMenu
                    theme="light"
                    value={active}
                    onChange={(v) => setActive(v)}
                    logo={
                        <img
                            id="logo"
                            src={logo}
                            height="28"
                            alt="logo"
                            onClick={() => redirect("/")}
                        />
                    }
                    operations={operations()}>
                    <MenuItem value={"0"}>
                        <span>{i18next.t("indexPage")}</span>
                    </MenuItem>
                    <MenuItem value={"1"}>
                        <span>LauncherX</span>
                    </MenuItem>
                    <MenuItem value={"2"}>
                        <span>CMFS</span>
                    </MenuItem>
                    <MenuItem value={"3"}>
                        <span>{i18next.t("cskb")}</span>
                    </MenuItem>
                    <MenuItem value={"4"}>
                        <span>{i18next.t("moreProjects")}</span>
                    </MenuItem>
                </HeadMenu>
            </div>
        </>
    );
}

export default MenuBar;
