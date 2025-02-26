import { StoredAuthEmail } from "../requests/LxAuthRequests.ts";

export const I18NLangKey = "I18N_LANG_KEY";

export function getStorageItem(key: string) {
    const userEmail = localStorage.getItem(StoredAuthEmail);

    // User doesn't save credentials
    if (!userEmail) {
        return sessionStorage.getItem(key);
    }

    return localStorage.getItem(key);
}
