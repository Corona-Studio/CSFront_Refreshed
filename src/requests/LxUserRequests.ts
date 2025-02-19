import axios from "axios";

import IResponse from "../interfaces/IResponse.ts";
import { csBackend } from "./ApiConstants.ts";

interface UserChannelInfo {
    branch: string;
    channel: number;
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

export async function getUserCurrentChannelAsync(token: string): Promise<IResponse<UserChannelInfo> | undefined> {
    const endPoint = "/Build/user/channel/current";

    return await getAsync<UserChannelInfo>(endPoint, token);
}
