import { DeviceIcon, HomeIcon, MoneyIcon, UserLockedIcon } from "tdesign-icons-react";

import { isAdminSessionValid } from "../../helpers/SessionHelper.ts";
import i18next from "../../i18n.ts";
import { MenuLinkModel } from "../ManagementPageBaseElement.tsx";

const t = i18next.t;

export const userPageMenuLinks: () => MenuLinkModel[] = () => [
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
    },
    {
        icon: <UserLockedIcon />,
        to: "/admin",
        value: t("adminCenter"),
        visible: () => {
            return isAdminSessionValid(false);
        }
    }
];
