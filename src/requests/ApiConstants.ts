import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";

import IResponse from "../interfaces/IResponse.ts";

export const lxBackendUrl = import.meta.env.VITE_LX_BACKEND ?? "https://api.corona.studio";

export const csBackend = axios.create({
    baseURL: lxBackendUrl,
    timeout: 15_000,
    headers: {
        Accept: "application/json"
    }
});

export function buildHeader(
    token: string,
    data: unknown = undefined,
    query: unknown = undefined
): AxiosRequestConfig<unknown> {
    return {
        headers: {
            Authorization: `Bearer ${token}`
        },
        data,
        params: query
    };
}

async function requestAsync<T>(
    method: Method,
    endPoint: string,
    data?: unknown,
    axiosConfig: AxiosRequestConfig<unknown> = {}
): Promise<IResponse<T>> {
    try {
        const response: AxiosResponse<T> = await csBackend.request<T>({
            ...axiosConfig,
            method,
            url: endPoint,
            data: data ?? axiosConfig.data
        });

        return {
            status: response.status,
            response: response.data
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                status: error.response?.status ?? 0,
                message: error.message
            };
        }

        return {
            status: 0,
            message: error instanceof Error ? error.message : "Unknown request error"
        };
    }
}

export function getAsync<T>(endPoint: string, axiosConfig: AxiosRequestConfig<unknown> = {}) {
    return requestAsync<T>("GET", endPoint, undefined, axiosConfig);
}

export async function postAsync<T>(
    endPoint: string,
    req: unknown,
    axiosConfig: AxiosRequestConfig<unknown> = {}
): Promise<IResponse<T>> {
    return requestAsync<T>("POST", endPoint, req, axiosConfig);
}

export async function putAsync<T>(
    endPoint: string,
    req: unknown,
    axiosConfig: AxiosRequestConfig<unknown> = {}
): Promise<IResponse<T>> {
    return requestAsync<T>("PUT", endPoint, req, axiosConfig);
}

export async function patchAsync<T>(
    endPoint: string,
    req: unknown,
    axiosConfig: AxiosRequestConfig<unknown> = {}
): Promise<IResponse<T>> {
    return requestAsync<T>("PATCH", endPoint, req, axiosConfig);
}

export async function deleteAsync<T>(endPoint: string, axiosConfig: AxiosRequestConfig<unknown> = {}) {
    return requestAsync<T>("DELETE", endPoint, undefined, axiosConfig);
}
