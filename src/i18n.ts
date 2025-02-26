import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { I18NLangKey } from "./helpers/StorageHelper.ts";
import { enUS } from "./langs/en_US.ts";
import { zhCN } from "./langs/zh_CN.ts";

export const resources = {
    zhCN: zhCN,
    enUS: enUS
} as const;

i18n.use(initReactI18next)
    .init({
        lng: localStorage.getItem(I18NLangKey) ?? "zhCN",
        resources,
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    })
    .then(() => {});

export default i18n;
