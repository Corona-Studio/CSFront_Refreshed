import localForage from "localforage";

export const I18NLangKey = "I18N_LANG_KEY";

export async function getStorageItemAsync(key: string) {
    const localForageValue = await localForage.getItem<string>(key);

    // User doesn't save credentials
    if (!localForageValue) {
        return sessionStorage.getItem(key);
    }

    return localForageValue;
}
