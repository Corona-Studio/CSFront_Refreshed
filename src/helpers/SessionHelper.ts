import {
    StoredAuthExpired,
    StoredAuthToken,
    StoredAuthUserId,
    StoredAuthUserName
} from "../requests/LxAuthRequests.ts";
import { getStorageItem } from "./StorageHelper.ts";

// Check if the session is valid
// Side effect: It will reset the storage when session is invalid
export function isSessionValid() {
    const token = getStorageItem(StoredAuthToken);
    const expireDate = getStorageItem(StoredAuthExpired);

    if (!token || !expireDate) {
        console.log("No saved token, continue login...");
        return false;
    }

    if (new Date(expireDate).getTime() <= new Date().getTime()) {
        console.log("Token expired, continue login...");

        // Reset saved token
        localStorage.setItem(StoredAuthToken, "");
        localStorage.setItem(StoredAuthExpired, "");
        localStorage.setItem(StoredAuthUserName, "");
        localStorage.setItem(StoredAuthUserId, "");

        sessionStorage.setItem(StoredAuthToken, "");
        sessionStorage.setItem(StoredAuthExpired, "");
        sessionStorage.setItem(StoredAuthUserName, "");
        sessionStorage.setItem(StoredAuthUserId, "");

        return false;
    }

    return true;
}
