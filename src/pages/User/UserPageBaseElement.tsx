import i18next from "i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useMatches, useNavigate } from "react-router";
import { DeviceIcon, HomeIcon, MoneyIcon, ViewListIcon } from "tdesign-icons-react";
import { Button, Divider, Menu } from "tdesign-react";
import type { MenuValue } from "tdesign-react";
import useScroll from "tdesign-react/es/back-top/useScroll";
import MenuItem from "tdesign-react/es/menu/MenuItem";

import { useWindowResize } from "../../helpers/WindowResizeHelper.ts";
import IMatches from "../../interfaces/IMatches.ts";

interface HandleType {
    title: (param?: string) => string;
}

const t = i18next.t;

function UserPageBaseElement() {
    const [active, setActive] = useState<MenuValue>("home");
    const [collapsed, setCollapsed] = useState(false);
    const [menuHeight, setMenuHeight] = useState("100vh");
    const [title, setTitle] = useState("");

    const containerRef = useRef<HTMLDivElement | null>(null);
    const windowBounds = useWindowResize();

    const navigate = useNavigate();
    const location = useLocation();

    const scrollContainer = useMemo(() => document, []);
    const { scrollTop } = useScroll({ target: scrollContainer });

    const matches = useMatches() as IMatches[];
    const { handle, data } = matches[matches.length - 1];

    const titleHandle = !!handle && !!(handle as HandleType).title;

    const menuLinks = [
        {
            icon: <HomeIcon />,
            to: "/user",
            value: t("userCenter")
        },
        {
            icon: <DeviceIcon />,
            to: "/user/device",
            value: t("deviceManage")
        },
        {
            icon: <MoneyIcon />,
            to: "/user/sponsor",
            value: t("sponsor")
        }
    ];

    useEffect(() => {
        setActive(location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        const title = (handle as HandleType).title(data as string | undefined);

        if (!title) return;

        setTitle(title);
    }, [data, handle, titleHandle]);

    useEffect(() => {
        const footer = document.getElementById("footer");

        const footerHeight = footer?.offsetHeight ?? 0;
        const htmlScrollableHeight = document.documentElement.offsetHeight - windowBounds[1];
        const bodyScrollableHeightExpectFooter = htmlScrollableHeight - footerHeight - 10;
        let footerShowedHeight = scrollTop - bodyScrollableHeightExpectFooter;

        if (footerShowedHeight < 0) footerShowedHeight = 0;

        console.log(footerShowedHeight);

        setMenuHeight(`calc(100vh - ${footerShowedHeight}px)`);
    }, [scrollTop, windowBounds]);

    return (
        <>
            <div className="flex h-screen overflow-y-hidden">
                <Menu
                    value={active}
                    logo={<div />}
                    collapsed={collapsed}
                    expandMutex={false}
                    style={{ top: scrollTop, height: menuHeight }}
                    className="absolute h-full hover:shadow-lg active:shadow-md shadow transition"
                    onChange={(v) => setActive(v)}
                    operations={
                        <Button
                            variant="text"
                            shape="square"
                            icon={<ViewListIcon />}
                            onClick={() => setCollapsed(!collapsed)}
                        />
                    }>
                    {menuLinks.map((link, i) => (
                        <MenuItem key={i} value={link.to} icon={link.icon} onClick={() => navigate(link.to)}>
                            <span>{link.value}</span>
                        </MenuItem>
                    ))}
                </Menu>

                <div className="relative w-screen h-full">
                    <h3>主页</h3>
                    <div ref={containerRef} className="p-[3%] m-auto">
                        <h3 className="pt-4">{title}</h3>
                        <Divider align="center" layout="horizontal" />
                        <div className="relative">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserPageBaseElement;
