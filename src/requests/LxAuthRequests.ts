import axios from "axios";

import IResponse from "../interfaces/IResponse.ts";
import { csBackend } from "./ApiConstants.ts";

export const StoredAuthEmail = "AUTH_EMAIL";
export const StoredAuthPassword = "AUTH_PASSWORD";
export const StoredAuthToken = "AUTH_TOKEN";
export const StoredAuthExpired = "AUTH_EXPIRED";
export const StoredAuthUserName = "AUTH_USERNAME";
export const StoredAuthUserId = "AUTH_USERID";

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    username: string;
    password: string;
}

interface RawLoginResponse {
    username: string;
    id: string;
    isPaid: boolean;
    branch: string;
    channel: number;
    token: string;
    expiration: string;
}

interface IdentityError {
    code?: string;
    describe?: string;
}

interface RegisterResponse {
    succeeded: boolean;
    errors?: IdentityError[];
}

async function postAsync<T>(endPoint: string, req: unknown): Promise<IResponse<T> | undefined> {
    try {
        const response = await csBackend.post<T>(endPoint, req);

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

export async function loginAsync(req: LoginRequest): Promise<IResponse<RawLoginResponse> | undefined> {
    const endPoint = "/User/login";

    return await postAsync(endPoint, req);
}

export async function registerAsync(req: RegisterRequest): Promise<IResponse<RegisterResponse> | undefined> {
    const endPoint = "/User/register";

    return await postAsync(endPoint, req);
}

export async function forgePasswordAsync(email: string): Promise<IResponse<boolean> | undefined> {
    const endPoint = "/User/pwd/reset";

    try {
        await csBackend.get(endPoint, { params: { email } });

        return { status: 200, response: true };
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
