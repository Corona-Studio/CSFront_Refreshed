import IResponse from "../interfaces/IResponse.ts";
import { buildHeader, getAsync, putAsync } from "./ApiConstants.ts";

interface DashboardData {
    type: string;
    dataTitleKey: string;
    dataDescKey: string;
    count: string;
}

export interface UserSponsorInfo {
    userName: string;
    email: string;
    id: string;
    isPaid: boolean;
}

export async function getDashboardDataAsync(token: string): Promise<IResponse<DashboardData[]> | undefined> {
    const endPoint = "/Admin/dashboard";

    return await getAsync<DashboardData[]>(endPoint, buildHeader(token));
}

export async function querySponsorInfoAsync(
    token: string,
    email: string
): Promise<IResponse<UserSponsorInfo> | undefined> {
    const endPoint = "/Admin/sponsor/userInfo";

    return await getAsync<UserSponsorInfo>(endPoint, buildHeader(token, undefined, { email }));
}

export async function setUserAsSponsorAsync(
    token: string,
    email: string
): Promise<IResponse<UserSponsorInfo> | undefined> {
    const endPoint = "/Admin/sponsor/set";

    return await putAsync<UserSponsorInfo>(endPoint, { email }, buildHeader(token));
}
