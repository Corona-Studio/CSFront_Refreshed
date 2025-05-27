import { t } from "i18next";

import { StoredAuthToken } from "../requests/LxAuthRequests.ts";
import { checkUserIsPaidAsync } from "../requests/LxUserRequests.ts";
import { getStorageItemAsync } from "./StorageHelper.ts";

async function checkPaidAsync() {
    const authToken = await getStorageItemAsync(StoredAuthToken);
    return await checkUserIsPaidAsync(authToken ?? "");
}

export async function checkIsPaidImpl(): Promise<boolean> {
    const r = await checkPaidAsync();
    if (!r || !r.status) throw new Error(t("backendServerError"));
    if (r.status === 404) throw new Error(t("failedToGetIsPaidDescription"));
    if (r.response === undefined) throw new Error(t("backendServerError"));

    return r.response!;
}
