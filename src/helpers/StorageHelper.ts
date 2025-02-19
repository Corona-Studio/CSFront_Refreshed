import { StoredAuthEmail } from "../requests/LxAuthRequests.ts";

export function getStorageItem(key: string) {
    const userEmail = localStorage.getItem(StoredAuthEmail);

    // User doesn't save credentials
    if (!userEmail) {
        return sessionStorage.getItem(key);
    }

    return localStorage.getItem(key);
}
