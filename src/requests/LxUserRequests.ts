import axios from "axios";

import IResponse from "../interfaces/IResponse.ts";
import { csBackend } from "./ApiConstants.ts";

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

async function getAsync<T>(endPoint: string, token: string) {
    try {
        const response = await csBackend.get<T>(endPoint, { headers: { Authorization: `Bearer ${token}` } });

        return {
            status: 200,
            response: response.data
        };
    } catch (error) {
        console.error(error);

        if (axios.isAxiosError(error)) {
            return {
                status: error.status
            };
        }

        return undefined;
    }
}

async function deleteAsync<T>(endPoint: string, request: unknown, token: string) {
    try {
        const response = await csBackend.delete<T>(endPoint, {
            headers: { Authorization: `Bearer ${token}` },
            data: request
        });

        return {
            status: 200,
            response: response.data
        };
    } catch (error) {
        console.error(error);

        if (axios.isAxiosError(error)) {
            return {
                status: error.status
            };
        }

        return undefined;
    }
}

export async function getUserCurrentChannelAsync(token: string): Promise<IResponse<UserChannelInfo> | undefined> {
    const endPoint = "/Build/user/channel/current";

    return await getAsync<UserChannelInfo>(endPoint, token);
}

export async function getUserAllDevicesAsync(token: string): Promise<IResponse<UserDeviceInfo[]> | undefined> {
    const endPoint = "/Device/fetch/all";

    return await getAsync<UserDeviceInfo[]>(endPoint, token);
}

export async function removeDeviceAsync(device: UserDeviceInfo, token: string): Promise<IResponse<string> | undefined> {
    const endPoint = "/Device/remove";

    return await deleteAsync(endPoint, device, token);
}

export async function checkUserIsPaidAsync(token: string): Promise<IResponse<boolean> | undefined> {
    const endPoint = "/User/isPaid";

    return await getAsync(endPoint, token);
}

export async function redeemAsync(orderNumber: string, token: string): Promise<IResponse<string> | undefined> {
    const endPoint = `Afdian/redeem/${orderNumber}`;

    return await getAsync(endPoint, token);
}
