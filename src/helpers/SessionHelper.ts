import { JwtPayload, jwtDecode } from "jwt-decode";

import {
    StoredAuthExpired,
    StoredAuthToken,
    StoredAuthUserId,
    StoredAuthUserName
} from "../requests/LxAuthRequests.ts";
import { getStorageItem } from "./StorageHelper.ts";

export const JwtRoleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function resetCredentials() {
    // Reset saved token
    localStorage.setItem(StoredAuthToken, "");
    localStorage.setItem(StoredAuthExpired, "");
    localStorage.setItem(StoredAuthUserName, "");
    localStorage.setItem(StoredAuthUserId, "");

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

// Check if the User session is valid
// Side effect: It will reset the storage when session is invalid
export function isUserSessionValid() {
    const token = getStorageItem(StoredAuthToken);
    const expireDate = getStorageItem(StoredAuthExpired);

    const result = generalChecks(token, expireDate);

    if (!result) resetCredentials();

    return result;
}

// Check if the Admin session is valid
// Side effect: It will reset the storage when session is invalid
export function isAdminSessionValid(isResetCredentials: boolean) {
    const token = getStorageItem(StoredAuthToken);
    const expireDate = getStorageItem(StoredAuthExpired);

    if (!generalChecks(token, expireDate)) {
        if (isResetCredentials) resetCredentials();

        return false;
    }

    const decodedHeader = jwtDecode<JwtPayload>(token!);

    for (const [key, value] of Object.entries(decodedHeader)) {
        if (key !== JwtRoleKey) continue;
        if (!value) continue;

        const values = value as string[];

        return values.includes("admin");
    }

    return false;
}
