import { HomeIcon, MoneyIcon, UserTransmitIcon } from "tdesign-icons-react";

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
        icon: <UserTransmitIcon />,
        to: "/user",
        value: t("returnToUserCenter")
    }
];
