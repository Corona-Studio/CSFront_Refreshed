import IResponse from "../interfaces/IResponse.ts";
import { getAsync, postAsync } from "./ApiConstants.ts";

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

export async function loginAsync(req: LoginRequest): Promise<IResponse<RawLoginResponse> | undefined> {
    const endPoint = "/User/login";

    return await postAsync(endPoint, req);
}

export async function registerAsync(req: RegisterRequest): Promise<IResponse<RegisterResponse> | undefined> {
    const endPoint = "/User/register";

    return await postAsync(endPoint, req);
}

export async function forgePasswordAsync(email: string): Promise<IResponse<unknown> | undefined> {
    const endPoint = "/User/pwd/reset";

    return await getAsync(endPoint, { params: { email } });
}

export async function emailVerifyAsync(
    code: string,
    email: string,
    val: string,
    verifyFor: string
): Promise<IResponse<string> | undefined> {
    const endPoint = "/User/code/confirm";

    return await getAsync(endPoint, { params: { code, email, val, verifyFor } });
}
