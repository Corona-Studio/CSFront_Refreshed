import { JwtPayload, jwtDecode } from "jwt-decode";
import localForage from "localforage";

import {
    StoredAuthEmail,
    StoredAuthExpired,
    StoredAuthPassword,
    StoredAuthToken,
    StoredAuthUserId,
    StoredAuthUserName
} from "../requests/LxAuthRequests.ts";
import { getStorageItemAsync } from "./StorageHelper.ts";

export const JwtRoleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

async function resetCredentialsAsync() {
    // Reset saved token
    await localForage.setItem(StoredAuthToken, "");
    await localForage.setItem(StoredAuthExpired, "");
    await localForage.setItem(StoredAuthUserName, "");
    await localForage.setItem(StoredAuthUserId, "");

    sessionStorage.setItem(StoredAuthToken, "");
    sessionStorage.setItem(StoredAuthExpired, "");
    sessionStorage.setItem(StoredAuthUserName, "");
    sessionStorage.setItem(StoredAuthUserId, "");
}

function generalChecks(token: string | null, expireDate: string | null) {
    if (!token || !expireDate) {
        console.log("No saved token, continue login...");
        return false;
    }

    return new Date(expireDate).getTime() > new Date().getTime();
}

export function clearOldLocalStorageInfo() {
    localStorage.removeItem(StoredAuthEmail);
    localStorage.removeItem(StoredAuthPassword);
    localStorage.removeItem(StoredAuthToken);
    localStorage.removeItem(StoredAuthExpired);
    localStorage.removeItem(StoredAuthUserName);
    localStorage.removeItem(StoredAuthUserId);
}

export async function clearForageStorageAsync() {
    await localForage.setItem(StoredAuthEmail, "");
    await localForage.setItem(StoredAuthPassword, "");
    await localForage.setItem(StoredAuthToken, "");
    await localForage.setItem(StoredAuthExpired, "");
    await localForage.setItem(StoredAuthUserName, "");
    await localForage.setItem(StoredAuthUserId, "");
}

// Check if the User session is valid
// Side effect: It will reset the storage when session is invalid
export async function isUserSessionValidAsync() {
    // Clear old local storage info
    clearOldLocalStorageInfo();

    const token = await getStorageItemAsync(StoredAuthToken);
    const expireDate = await getStorageItemAsync(StoredAuthExpired);

    const result = generalChecks(token, expireDate);

    if (!result) await resetCredentialsAsync();

    return result;
}

// Check if the Admin session is valid
// Side effect: It will reset the storage when session is invalid
export async function isAdminSessionValidAsync(isResetCredentials: boolean) {
    const token = await getStorageItemAsync(StoredAuthToken);
    const expireDate = await getStorageItemAsync(StoredAuthExpired);

    if (!generalChecks(token, expireDate)) {
        if (isResetCredentials) await resetCredentialsAsync();

        return false;
    }

    const decodedHeader = jwtDecode<JwtPayload>(token!);

    for (const [key, value] of Object.entries(decodedHeader)) {
        if (key !== JwtRoleKey) continue;
        if (!value) continue;

        const values = value as string[];

        for (const v of values) {
            if (v === "admin") {
                return true;
            }
        }
    }

    return false;
}
