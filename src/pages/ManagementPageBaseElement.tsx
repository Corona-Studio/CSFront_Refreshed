import { Suspense, lazy, useEffect, useState } from "react";
import { Outlet, useLocation, useMatches, useNavigate } from "react-router";
import { ViewListIcon } from "tdesign-icons-react";
import { Button, Dropdown, DropdownOption, Menu, Skeleton } from "tdesign-react";
import type { MenuValue } from "tdesign-react";
import { TElement } from "tdesign-react/es/common";
import MenuItem from "tdesign-react/es/menu/MenuItem";

import IMatches from "../interfaces/IMatches.ts";
import styles from "./ManagementPageBaseElement.module.css";

const AsyncVisibilityContainer = lazy(() => import("../components/AsyncVisibilityContainer.tsx"));

interface HandleType {
    title: (param?: string) => string;
}

export interface MenuLinkModel {
    icon: TElement;
    to: string;
    value: string;
    visible?: () => Promise<boolean>;
    visibleInDropDown?: boolean;
}

export interface ManagementPageBaseElementProps {
    links: () => MenuLinkModel[];
    userSessionValidation: boolean;
    userSessionValidator?: () => Promise<boolean>;
    invalidJumpPage?: string;
    variant?: "admin";
}

function ManagementPageBaseElement({
    links = () => [],
    userSessionValidation = false,
    userSessionValidator = () => Promise.resolve(true),
    invalidJumpPage = "/",
    variant
}: ManagementPageBaseElementProps) {
    const isAdmin = variant === "admin";
    const [active, setActive] = useState<MenuValue>("/user");
    const [collapsed, setCollapsed] = useState(false);
    const [title, setTitle] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    const matches = useMatches() as IMatches[];
    const { handle, loaderData } = matches[matches.length - 1];

    const titleHandle = !!handle && !!(handle as HandleType).title;
    const menuLinks = links();

    useEffect(() => {
        async function checkAuthAsync() {
            if (!userSessionValidation) return;
            if (await userSessionValidator()) return;

            navigate(`${invalidJumpPage}?redirect=${location.pathname}`);
        }

        checkAuthAsync().then();
    }, [invalidJumpPage, location.pathname, navigate, userSessionValidation, userSessionValidator]);

    useEffect(() => {
        setActive(location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        const title = (handle as HandleType).title(loaderData as string | undefined);

        if (!title) return;

        setTitle(title);
    }, [loaderData, handle, titleHandle]);

    function onMenuItemClicked(dropdownItem: DropdownOption) {
        if (!dropdownItem.value) return;

        const value = dropdownItem.value as string;

        navigate(value);
    }

    return (
        <>
            <div className={`${styles.adminShell} ${collapsed ? styles.adminShellCollapsed : ""}`}>
                <div className={styles.adminSidebar}>
                    <Menu
                        value={active}
                        logo={<div />}
                        collapsed={collapsed}
                        expandMutex={false}
                        className={styles.adminMenu}
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
                            <Suspense key={i} fallback={<Skeleton loading={true} />}>
                                <AsyncVisibilityContainer visible={link.visible}>
                                    <MenuItem value={link.to} icon={link.icon} onClick={() => navigate(link.to)}>
                                        <span>{link.value}</span>
                                    </MenuItem>
                                </AsyncVisibilityContainer>
                            </Suspense>
                        ))}
                    </Menu>
                </div>

                <div className={styles.adminMain}>
                    <div className={styles.adminContent}>
                        <div className={styles.adminHeading}>
                            <div className="md:hidden">
                                <Dropdown
                                    direction="right"
                                    hideAfterItemClick={true}
                                    placement="bottom"
                                    trigger="click"
                                    options={menuLinks
                                        .filter(
                                            (link) => link.visibleInDropDown === undefined || link.visibleInDropDown
                                        )
                                        .map((link) => ({ content: link.value, value: link.to }))}
                                    onClick={onMenuItemClicked}>
                                    <Button
                                        variant="text"
                                        shape="square"
                                        className="flex lg:hidden"
                                        icon={<ViewListIcon />}
                                    />
                                </Dropdown>
                            </div>
                            <h1 className={styles.adminTitle}>{title}</h1>
                        </div>
                        <div className={isAdmin ? styles.adminBody : "relative"}>
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ManagementPageBaseElement;
