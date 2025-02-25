import IResponse from "../interfaces/IResponse.ts";
import { buildHeader, deleteAsync, getAsync } from "./ApiConstants.ts";

interface UserChannelInfo {
    branch: string;
    channel: number;
}

export interface UserDeviceInfo {
    id: string;
    userId: string;
    computerName: string;
    processorId: string;
    bios: string;
    mac: string;
}

export async function getUserCurrentChannelAsync(token: string): Promise<IResponse<UserChannelInfo> | undefined> {
    const endPoint = "/Build/user/channel/current";

    return await getAsync<UserChannelInfo>(endPoint, buildHeader(token));
}

export async function getUserAllDevicesAsync(token: string): Promise<IResponse<UserDeviceInfo[]> | undefined> {
    const endPoint = "/Device/fetch/all";

    return await getAsync<UserDeviceInfo[]>(endPoint, buildHeader(token));
}

export async function removeDeviceAsync(device: UserDeviceInfo, token: string): Promise<IResponse<string> | undefined> {
    const endPoint = "/Device/remove";

    return await deleteAsync(endPoint, buildHeader(token, device));
}

export async function checkUserIsPaidAsync(token: string): Promise<IResponse<boolean> | undefined> {
    const endPoint = "/User/isPaid";

    return await getAsync(endPoint, buildHeader(token));
}

export async function redeemAsync(orderNumber: string, token: string): Promise<IResponse<string> | undefined> {
    const endPoint = `Afdian/redeem/${orderNumber}`;

    return await getAsync(endPoint, buildHeader(token));
}
