import { JwtPayload, jwtDecode } from "jwt-decode";
import localForage from "localforage";

import {
    RawLoginResponse,
    StoredAuthEmail,
    StoredAuthExpired,
    StoredAuthPassword,
    StoredAuthToken,
    StoredAuthUserId,
    StoredAuthUserName
} from "../requests/LxAuthRequests.ts";
import { getStorageItemAsync } from "./StorageHelper.ts";

export const JwtRoleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const credentialKeys = [
    StoredAuthEmail,
    StoredAuthPassword,
    StoredAuthToken,
    StoredAuthExpired,
    StoredAuthUserName,
    StoredAuthUserId
] as const;

function generalChecks(token: string | null, expireDate: string | null) {
    if (!token || !expireDate) {
        return false;
    }

    return new Date(expireDate).getTime() > new Date().getTime();
}

export function clearOldLocalStorageInfo() {
    credentialKeys.forEach((key) => localStorage.removeItem(key));
}

export async function clearForageStorageAsync() {
    await Promise.all(credentialKeys.map((key) => localForage.removeItem(key)));
}

export async function clearSessionAsync() {
    await clearForageStorageAsync();
    credentialKeys.forEach((key) => sessionStorage.removeItem(key));
    clearOldLocalStorageInfo();
}

export async function saveSessionAsync(response: RawLoginResponse, email: string, persistent: boolean) {
    await clearSessionAsync();

    const values = new Map<string, string>([
        [StoredAuthEmail, email],
        [StoredAuthToken, response.token],
        [StoredAuthExpired, new Date(response.expiration).toISOString()],
        [StoredAuthUserName, response.username],
        [StoredAuthUserId, response.id]
    ]);

    if (persistent) {
        await Promise.all([...values].map(([key, value]) => localForage.setItem(key, value)));
        return;
    }

    values.forEach((value, key) => sessionStorage.setItem(key, value));
}

// Check if the User session is valid
// Side effect: It will reset the storage when session is invalid
export async function isUserSessionValidAsync() {
    // Clear old local storage info
    clearOldLocalStorageInfo();

    const token = await getStorageItemAsync(StoredAuthToken);
    const expireDate = await getStorageItemAsync(StoredAuthExpired);

    const result = generalChecks(token, expireDate);

    if (!result) await clearSessionAsync();

    return result;
}

// Check if the Admin session is valid
// Side effect: It will reset the storage when session is invalid
export async function isAdminSessionValidAsync(isResetCredentials: boolean) {
    const token = await getStorageItemAsync(StoredAuthToken);
    const expireDate = await getStorageItemAsync(StoredAuthExpired);

    if (!generalChecks(token, expireDate)) {
        if (isResetCredentials) await clearSessionAsync();

        return false;
    }

    try {
        const roles = jwtDecode<JwtPayload & Record<string, unknown>>(token!)[JwtRoleKey];
        const values = Array.isArray(roles) ? roles : [roles];
        return values.includes("admin");
    } catch {
        if (isResetCredentials) await clearSessionAsync();
        return false;
    }
}
