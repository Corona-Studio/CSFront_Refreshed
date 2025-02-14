import styles from "./MenuBar.module.css";
import { useNavigate } from "react-router";
import { Button, MenuValue } from "tdesign-react";
import { SunnyIcon, MoonIcon, LinkIcon } from "tdesign-icons-react";
import HeadMenu from "tdesign-react/es/menu/HeadMenu";
import { useState } from "react";
import MenuItem from "tdesign-react/es/menu/MenuItem";
import logo from "../assets/logo.png";
import i18next from "../i18n";

function MenuBar() {
    const [active, setActive] = useState<MenuValue>("0");
    const [isDarkMode, setDarkMode] = useState(true);

    const navigate = useNavigate();

    const operations = () => (
        <div className="pr-8">
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
            <div className="fixed flex gap-1.5 top-0 w-screen z-30 hover:shadow-lg active:shadow transition">
                <HeadMenu
                    theme="light"
                    value={active}
                    onChange={(v) => setActive(v)}
                    logo={
                        <img
                            className={styles.menuLogo}
                            src={logo}
                            height="28"
                            alt="logo"
                            onClick={onLogoClicked}
                        />
                    }
                    operations={operations()}>
                    <MenuItem value={"0"} onClick={() => navigate("/")}>
                        <span>{i18next.t("indexPage")}</span>
                    </MenuItem>
                    <MenuItem value={"1"} onClick={() => navigate("/lx")}>
                        <span>LauncherX</span>
                    </MenuItem>
                    <MenuItem value={"2"}>
                        <span>CMFS</span>
                    </MenuItem>
                    <MenuItem value={"3"} href="https://kb.corona.studio/" target="_blank">
                        <span>
                            {i18next.t("cskb")}
                            <LinkIcon />
                        </span>
                    </MenuItem>
                    <MenuItem value={"4"} href="https://github.com/Corona-Studio/" target="_blank">
                        <span>
                            {i18next.t("moreProjects")}
                            <LinkIcon />
                        </span>
                    </MenuItem>
                </HeadMenu>
            </div>
        </>
    );
}

export default MenuBar;
