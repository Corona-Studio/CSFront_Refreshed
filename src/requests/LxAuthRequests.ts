import IResponse from "../interfaces/IResponse.ts";
import { postAsync } from "./ApiConstants.ts";

export const StoredAuthEmail = "AUTH_EMAIL";
export const StoredAuthPassword = "AUTH_PASSWORD";
export const StoredAuthToken = "AUTH_TOKEN";
export const StoredAuthExpired = "AUTH_EXPIRED";
export const StoredAuthUserName = "AUTH_USERNAME";
export const StoredAuthUserId = "AUTH_USERID";
export const StoredRegistrationVerification = "REGISTER_VERIFICATION";
export const StoredPasswordResetEmail = "PASSWORD_RESET_EMAIL";

interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    username: string;
    password: string;
}

interface PasswordResetConfirmRequest {
    email: string;
    code: string;
    newPassword: string;
}

export interface RawLoginResponse {
    username: string;
    email?: string;
    id: string;
    isPaid: boolean;
    branch: string;
    channel: number;
    token: string;
    expiration: string;
    verificationRequired?: boolean;
    verificationCode?: string;
    verificationCodeExpiresAt?: string;
    qqGroups?: string[];
}

interface IdentityError {
    code?: string;
    describe?: string;
}

export interface RegisterResponse {
    succeeded: boolean;
    errors?: IdentityError[];
    verificationCode: string;
    verificationCodeExpiresAt: string;
    qqGroups: string[];
}

export interface RegistrationVerificationInfo {
    username: string;
    verificationCode: string;
    verificationCodeExpiresAt: string;
    qqGroups: string[];
}

export async function loginAsync(req: LoginRequest): Promise<IResponse<RawLoginResponse> | undefined> {
    const endPoint = "/User/login";

    return await postAsync(endPoint, req);
}

export async function startVerificationAsync(req: LoginRequest): Promise<IResponse<RegistrationVerificationInfo>> {
    return await postAsync("/User/verification/start", req);
}

export async function registerAsync(req: RegisterRequest): Promise<IResponse<RegisterResponse> | undefined> {
    const endPoint = "/User/register";

    return await postAsync(endPoint, req);
}

export async function requestPasswordResetAsync(email: string): Promise<IResponse<unknown>> {
    return await postAsync("/User/password/reset/request", { email });
}

export async function confirmPasswordResetAsync(req: PasswordResetConfirmRequest): Promise<IResponse<unknown>> {
    return await postAsync("/User/password/reset/confirm", req);
}
