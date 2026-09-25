import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { I18NLangKey } from "./helpers/StorageHelper.ts";
import { enUS } from "./langs/en_US.ts";
import { zhCN } from "./langs/zh_CN.ts";

export const resources = {
    zhCN: zhCN,
    enUS: enUS
} as const;

const savedLanguage = localStorage.getItem(I18NLangKey);
const initialLanguage = savedLanguage && savedLanguage in resources ? savedLanguage : "zhCN";

i18n.use(initReactI18next).init({
    lng: initialLanguage,
    fallbackLng: "zhCN",
    resources,
    interpolation: {
        escapeValue: false // react already safes from xss
    }
});

export default i18n;
