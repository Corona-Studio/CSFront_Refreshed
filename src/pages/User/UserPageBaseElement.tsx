import i18next from "i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useMatches, useNavigate } from "react-router";
import { DeviceIcon, HomeIcon, MoneyIcon, ViewListIcon } from "tdesign-icons-react";
import { Button, Divider, Dropdown, DropdownOption, Menu } from "tdesign-react";
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
    const [active, setActive] = useState<MenuValue>("/user");
    const [collapsed, setCollapsed] = useState(false);
    const [menuHeight, setMenuHeight] = useState("100vh");
    const [containerHeight, setContainerHeight] = useState("100vh");
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

        setMenuHeight(`calc(100vh - ${footerShowedHeight}px)`);
    }, [scrollTop, windowBounds]);

    useEffect(() => {
        setTimeout(() => {
            if (!containerRef.current || containerRef.current.clientHeight < windowBounds[1]) {
                setContainerHeight("100vh");
                return;
            }

            setContainerHeight("100%");
        }, 100);
    }, [location, containerRef, windowBounds]);

    function onMenuItemClicked(dropdownItem: DropdownOption) {
        if (!dropdownItem.value) return;

        const value = dropdownItem.value as string;

        navigate(value);
    }

    return (
        <>
            <div className="flex overflow-y-hidden" style={{ height: containerHeight }}>
                <div className="hidden md:flex">
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
                </div>

                <div className="relative w-screen h-full">
                    <div ref={containerRef} className="px-[3%] py-[12%] md:py-[6%]">
                        <div className="flex items-end">
                            <div className="md:hidden">
                                <Dropdown
                                    direction="right"
                                    hideAfterItemClick={true}
                                    placement="bottom"
                                    trigger="hover"
                                    options={menuLinks.map((link) => ({ content: link.value, value: link.to }))}
                                    onClick={onMenuItemClicked}>
                                    <Button
                                        variant="text"
                                        shape="square"
                                        className="flex lg:hidden"
                                        icon={<ViewListIcon />}
                                    />
                                </Dropdown>
                            </div>
                            <h5 className="pt-4 font-bold">{title}</h5>
                        </div>
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
