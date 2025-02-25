import axios, { AxiosRequestConfig } from "axios";

import IResponse from "../interfaces/IResponse.ts";

export const lxBackendUrl = import.meta.env.VITE_LX_BACKEND ?? "https://api.corona.studio";

export const csBackend = axios.create({
    baseURL: lxBackendUrl
});

export function buildHeader(token: string, data: unknown = undefined): AxiosRequestConfig<unknown> {
    return {
        headers: {
            Authorization: `Bearer ${token}`
        },
        data: data
    };
}

export async function getAsync<T>(endPoint: string, axiosConfig: AxiosRequestConfig<unknown> = {}) {
    try {
        const response = await csBackend.get<T>(endPoint, axiosConfig);

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

export async function postAsync<T>(
    endPoint: string,
    req: unknown,
    axiosConfig: AxiosRequestConfig<unknown> = {}
): Promise<IResponse<T> | undefined> {
    try {
        const response = await csBackend.post<T>(endPoint, req, axiosConfig);

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

export async function deleteAsync<T>(endPoint: string, axiosConfig: AxiosRequestConfig<unknown> = {}) {
    try {
        const response = await csBackend.delete<T>(endPoint, axiosConfig);

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
