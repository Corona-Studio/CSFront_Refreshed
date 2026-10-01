import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useMatches, useNavigate, useNavigation } from "react-router";
import { ViewListIcon } from "tdesign-icons-react";
import { Button, Dropdown, DropdownOption, Menu, Skeleton } from "tdesign-react";
import type { MenuValue } from "tdesign-react";
import { TElement } from "tdesign-react/es/common";
import MenuItem from "tdesign-react/es/menu/MenuItem";

import { RouteHandle } from "../app/routeTypes.ts";
import Fallback from "./Fallback.tsx";
import styles from "./ManagementPageBaseElement.module.css";

const AsyncVisibilityContainer = lazy(() => import("../components/AsyncVisibilityContainer.tsx"));

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
    const [collapsed, setCollapsed] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const navigation = useNavigation();
    const pendingPath = navigation.state !== "idle" ? navigation.location?.pathname : undefined;
    const activePath = pendingPath ?? location.pathname;
    const selectedPath = activePath.startsWith("/admin/contributions/") ? "/admin/contributions" : activePath;

    const matches = useMatches();
    const currentMatch = matches[matches.length - 1];
    const handle = currentMatch?.handle as RouteHandle | undefined;
    const title = handle?.title?.(currentMatch?.loaderData) ?? "";
    const menuLinks = useMemo(() => links(), [links]);

    useEffect(() => {
        async function checkAuthAsync() {
            if (!userSessionValidation) return;
            if (await userSessionValidator()) return;

            navigate(`${invalidJumpPage}?redirect=${location.pathname}`);
        }

        checkAuthAsync().then();
    }, [invalidJumpPage, location.pathname, navigate, userSessionValidation, userSessionValidator]);

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
                        value={selectedPath as MenuValue}
                        collapsed={collapsed}
                        expandMutex={false}
                        className={styles.adminMenu}
                        onChange={(value) => typeof value === "string" && navigate(value)}
                        operations={
                            <Button
                                variant="text"
                                shape="square"
                                icon={<ViewListIcon />}
                                onClick={() => setCollapsed(!collapsed)}
                            />
                        }>
                        {menuLinks.map((link) => (
                            <Suspense key={link.to} fallback={<Skeleton loading={true} />}>
                                <AsyncVisibilityContainer visible={link.visible}>
                                    <MenuItem value={link.to} icon={link.icon}>
                                        <span className={styles.menuLabel}>
                                            {link.value}
                                            {pendingPath === link.to && (
                                                <span className={styles.menuSpinner} aria-label="加载中" />
                                            )}
                                        </span>
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
                                        icon={
                                            pendingPath ? (
                                                <span className={styles.menuSpinner} aria-label="加载中" />
                                            ) : (
                                                <ViewListIcon />
                                            )
                                        }
                                    />
                                </Dropdown>
                            </div>
                            <h1 className={styles.adminTitle}>
                                {pendingPath
                                    ? (menuLinks.find((link) => link.to === selectedPath)?.value ?? title)
                                    : title}
                            </h1>
                        </div>
                        <div className={isAdmin ? styles.adminBody : "relative"}>
                            {pendingPath ? <Fallback pathname={pendingPath} embedded /> : <Outlet />}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ManagementPageBaseElement;
