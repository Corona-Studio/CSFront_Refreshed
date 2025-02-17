import i18next from "i18next";
import { useMemo, useRef, useState } from "react";
import { Outlet } from "react-router";
import { HomeIcon, ViewListIcon } from "tdesign-icons-react";
import { Button, Divider, Menu } from "tdesign-react";
import type { MenuValue } from "tdesign-react";
import useScroll from "tdesign-react/es/back-top/useScroll";
import MenuItem from "tdesign-react/es/menu/MenuItem";

const t = i18next.t;

function UserPageBaseElement() {
    const [active, setActive] = useState<MenuValue>("home");
    const [collapsed, setCollapsed] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);

    const scrollContainer = useMemo(() => document, []);
    const { scrollTop } = useScroll({ target: scrollContainer });
    const menuTop = useMemo(() => {
        // if (!containerRef.current) return scrollTop;
        //
        // const footerHeight = (document.querySelector("#footer") as HTMLElement)?.offsetHeight + 10;
        //
        // console.log(containerRef.current.offsetHeight);
        //
        // if (window.screen.height - footerHeight > scrollTop) {
        //     console.log("!!!!!!!!!!!");
        //     return containerRef.current.offsetHeight - footerHeight;
        // }

        if (!containerRef.current) return scrollTop;
        if (scrollTop >= containerRef.current.offsetHeight) return containerRef.current.offsetHeight;

        return scrollTop;
    }, [scrollTop]);

    return (
        <>
            <div className="flex">
                <Menu
                    value={active}
                    logo={<div />}
                    collapsed={collapsed}
                    expandMutex={false}
                    style={{ top: menuTop }}
                    className="absolute h-screen hover:shadow-lg active:shadow-md shadow transition"
                    onChange={(v) => setActive(v)}
                    operations={
                        <Button
                            variant="text"
                            shape="square"
                            icon={<ViewListIcon />}
                            onClick={() => setCollapsed(!collapsed)}
                        />
                    }>
                    <MenuItem value={"home"} icon={<HomeIcon />}>
                        <span>{t("userCenter")}</span>
                    </MenuItem>
                </Menu>

                <div className="relative w-screen h-full">
                    <h3>主页</h3>
                    <div ref={containerRef} className="p-[3%] m-auto">
                        <h3>hhh</h3>
                        <Divider align="center" layout="horizontal" />
                        <div className="relative bg-indigo-700">
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                            <h1>ddd</h1>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserPageBaseElement;
