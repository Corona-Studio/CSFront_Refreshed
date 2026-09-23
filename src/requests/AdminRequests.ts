import type { TableRowData } from "tdesign-react";

import IResponse from "../interfaces/IResponse.ts";
import { buildHeader, getAsync, postAsync, putAsync } from "./ApiConstants.ts";

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

export interface AdminBuildInfo extends TableRowData {
    id: string;
    branch: string;
    channel: number;
    releaseDate: string;
    releaseNote: string;
    fileHash: string;
    isHotFix: boolean;
    isApproved: boolean;
    isReviewed: boolean;
    isR2R: boolean;
    framework: string;
    runtime: string;
    isCached: boolean;
}

export interface BuildCacheRefreshResult {
    buildCount: number;
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

export async function getAdminBuildsAsync(token: string): Promise<IResponse<AdminBuildInfo[]> | undefined> {
    return await getAsync<AdminBuildInfo[]>("/Admin/builds", buildHeader(token));
}

export async function setBuildHotFixAsync(
    token: string,
    build: AdminBuildInfo,
    isHotFix: boolean
): Promise<IResponse<AdminBuildInfo> | undefined> {
    return await postAsync<AdminBuildInfo>(
        "/Admin/builds/hotfix",
        {
            id: build.id,
            isHotFix,
            fileHash: build.fileHash,
            branch: build.branch,
            framework: build.framework,
            runtime: build.runtime,
            releaseDate: build.releaseDate
        },
        buildHeader(token)
    );
}

export async function refreshBuildCacheAsync(token: string): Promise<IResponse<BuildCacheRefreshResult> | undefined> {
    return await postAsync<BuildCacheRefreshResult>("/Admin/builds/cache/refresh", {}, buildHeader(token));
}
