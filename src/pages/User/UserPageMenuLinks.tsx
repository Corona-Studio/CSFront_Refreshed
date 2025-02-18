import { DeviceIcon, HomeIcon, MoneyIcon } from "tdesign-icons-react";

import i18next from "../../i18n.ts";

const t = i18next.t;

export const userPageMenuLinks = () => [
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
