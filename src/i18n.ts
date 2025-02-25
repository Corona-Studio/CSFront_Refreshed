import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { zhCN } from "./langs/zh_CN.ts";

export const resources = {
    zhCN: zhCN
} as const;

i18n.use(initReactI18next)
    .init({
        lng: "zhCN",
        resources,
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    })
    .then(() => {});

export default i18n;
