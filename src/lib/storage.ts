// Keep the browser storage driver out of the server render path.
// Every caller shares one initialization and the original CSFront store.
let initialization: Promise<LocalForage> | undefined;
async function getBrowserStore(): Promise<LocalForage> {
    if (typeof window === "undefined") throw new Error("Account storage is only available in the browser");
    initialization ??= import("localforage").then(({ default: store }) => {
        store.config({ driver: store.INDEXEDDB, name: "CSFront", version: 1, storeName: "cs_front_kv" });
        return store;
    });
    return initialization;
}
const storage = {
    async getItem<T>(key: string): Promise<T | null> {
        if (typeof window === "undefined") return null;
        return (await getBrowserStore()).getItem<T>(key);
    },
    async setItem<T>(key: string, value: T): Promise<T> {
        return (await getBrowserStore()).setItem(key, value);
    },
    async removeItem(key: string): Promise<void> {
        if (typeof window === "undefined") return;
        return (await getBrowserStore()).removeItem(key);
    }
};
export default storage;
