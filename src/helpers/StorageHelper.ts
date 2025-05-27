import localForage from "localforage";

import { StoredAuthToken } from "../requests/LxAuthRequests.ts";
import { checkUserIsPaidAsync } from "../requests/LxUserRequests.ts";

export const I18NLangKey = "I18N_LANG_KEY";

export async function getStorageItemAsync(key: string) {
    const localForageValue = await localForage.getItem<string>(key);

    // User doesn't save credentials
    if (!localForageValue) {
        return sessionStorage.getItem(key);
    }

    return localForageValue;
}
