import { HomeIcon } from "tdesign-icons-react";

import i18next from "../../i18n.ts";

const t = i18next.t;

export const userPageMenuLinks = () => [
    {
        icon: <HomeIcon />,
        to: "/admin",
        value: t("indexPage")
    }
];
