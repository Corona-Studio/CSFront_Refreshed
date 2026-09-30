import { getAsync, isSuccessfulResponse } from "./ApiConstants.ts";

export interface LauncherNotification {
    id: string;
    title: string;
    content: string;
    author: string;
    publishDate: string;
}

export async function getLauncherNotificationsAsync(): Promise<LauncherNotification[]> {
    const response = await getAsync<LauncherNotification[]>("/Notification", { params: { limit: 20 } });
    if (!isSuccessfulResponse(response) || !Array.isArray(response.response)) {
        throw new Error("Failed to load launcher notifications");
    }

    return response.response.filter((notification) => !notification.author.endsWith("_CONNECTX_ADM"));
}
