import {
    GitRepositoryCommitsIcon,
    HomeIcon,
    LayersIcon,
    MoneyIcon,
    NotificationIcon,
    UserTransmitIcon,
    UsergroupIcon
} from "tdesign-icons-react";

import i18next from "../../i18n.ts";

const t = i18next.t;

export const adminPageMenuLinks = () => [
    {
        icon: <HomeIcon />,
        to: "/admin",
        value: t("indexPage")
    },
    {
        icon: <MoneyIcon />,
        to: "/admin/sponsor",
        value: t("sponsorAdmin")
    },
    {
        icon: <LayersIcon />,
        to: "/admin/builds",
        value: t("buildManagement")
    },
    {
        icon: <UsergroupIcon />,
        to: "/admin/users",
        value: t("userManagement")
    },
    {
        icon: <NotificationIcon />,
        to: "/admin/notifications",
        value: t("notificationManagement")
    },
    {
        icon: <GitRepositoryCommitsIcon />,
        to: "/admin/contributions",
        value: t("contributionManagement")
    },
    {
        icon: <UserTransmitIcon />,
        to: "/user",
        value: t("returnToUserCenter")
    }
];
