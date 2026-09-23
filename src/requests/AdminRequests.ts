import type { TableRowData } from "tdesign-react";

import IResponse from "../interfaces/IResponse.ts";
import { buildHeader, deleteAsync, getAsync, patchAsync, postAsync, putAsync } from "./ApiConstants.ts";

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

export enum AdminUserType {
    User,
    Reader,
    Reviewer,
    ProjectManager,
    Admin
}

export interface AdminUserInfo extends TableRowData {
    id: string;
    userName: string;
    email: string;
    userType: AdminUserType;
    isPaid: boolean;
    emailConfirmed: boolean;
    isLockedOut: boolean;
}

export interface PagedResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface AdminNotificationInfo extends TableRowData {
    id: string;
    title: string;
    content: string;
    author: string;
    publishDate: string;
}

export interface NotificationWriteRequest {
    title: string;
    content: string;
    author: string;
}

export interface PendingContributionSummary extends TableRowData {
    id: string;
    originalName: string;
    translatedName?: string;
    contributionCount: number;
    rating: number;
}

export interface UserContributionBase extends TableRowData {
    id: string;
    userId: string;
    userName: string;
    thirdPartyTranslateRecordId: string;
}

export interface UserContributedTranslation extends UserContributionBase {
    translatedName?: string;
}

export interface UserContributedLink extends UserContributionBase {
    link?: string;
}

export interface UserContributedTag extends UserContributionBase {
    value?: string;
}

export interface ThirdPartyInfoRatingRecord extends TableRowData {
    id: string;
    userId: string;
    userName: string;
    thirdPartyInfoId: string;
    rate: number;
}

export interface PendingContributionDetail {
    resourceId: string;
    originalName: string;
    translatedName?: string;
    links: UserContributedLink[];
    tags: UserContributedTag[];
    translations: UserContributedTranslation[];
    ratings: ThirdPartyInfoRatingRecord[];
    rating: number;
}

export interface AcceptContributionRequest {
    translatedName: string;
    link?: string;
    tags: string[];
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

export async function getAdminUsersAsync(
    token: string,
    search: string,
    page: number,
    pageSize: number
): Promise<IResponse<PagedResult<AdminUserInfo>> | undefined> {
    return await getAsync<PagedResult<AdminUserInfo>>(
        "/Admin/users",
        buildHeader(token, undefined, { search: search || undefined, page, pageSize })
    );
}

export async function updateAdminUserTypeAsync(
    token: string,
    userId: string,
    userType: AdminUserType
): Promise<IResponse<AdminUserInfo> | undefined> {
    return await patchAsync<AdminUserInfo>(
        `/Admin/users/${encodeURIComponent(userId)}/type`,
        { userType },
        buildHeader(token)
    );
}

export async function getAdminNotificationsAsync(
    token: string,
    search: string,
    page: number,
    pageSize: number
): Promise<IResponse<PagedResult<AdminNotificationInfo>> | undefined> {
    return await getAsync<PagedResult<AdminNotificationInfo>>(
        "/Admin/notifications",
        buildHeader(token, undefined, { search: search || undefined, page, pageSize })
    );
}

export async function createAdminNotificationAsync(
    token: string,
    request: NotificationWriteRequest
): Promise<IResponse<AdminNotificationInfo> | undefined> {
    return await postAsync<AdminNotificationInfo>("/Admin/notifications", request, buildHeader(token));
}

export async function updateAdminNotificationAsync(
    token: string,
    id: string,
    request: NotificationWriteRequest
): Promise<IResponse<AdminNotificationInfo> | undefined> {
    return await putAsync<AdminNotificationInfo>(
        `/Admin/notifications/${encodeURIComponent(id)}`,
        request,
        buildHeader(token)
    );
}

export async function deleteAdminNotificationAsync(token: string, id: string): Promise<IResponse<unknown> | undefined> {
    return await deleteAsync<unknown>(`/Admin/notifications/${encodeURIComponent(id)}`, buildHeader(token));
}

export async function getPendingContributionsAsync(
    token: string
): Promise<IResponse<PendingContributionSummary[]> | undefined> {
    return await getAsync<PendingContributionSummary[]>("/Admin/contributions", buildHeader(token));
}

export async function getPendingContributionDetailAsync(
    token: string,
    resourceId: string
): Promise<IResponse<PendingContributionDetail> | undefined> {
    return await getAsync<PendingContributionDetail>(`/Admin/contributions/${resourceId}`, buildHeader(token));
}

export async function deleteContributionItemAsync(
    token: string,
    resourceType: "translation" | "link" | "tag",
    resourceId: string
): Promise<IResponse<unknown> | undefined> {
    return await deleteAsync<unknown>(`/Admin/contributions/${resourceType}/${resourceId}`, buildHeader(token));
}

export async function banContributionUserAsync(token: string, userId: string): Promise<IResponse<unknown> | undefined> {
    return await postAsync<unknown>(`/User/${userId}/ban`, {}, buildHeader(token));
}

export async function acceptContributionAsync(
    token: string,
    resourceId: string,
    request: AcceptContributionRequest
): Promise<IResponse<unknown> | undefined> {
    return await postAsync<unknown>(`/Admin/contributions/${resourceId}/accept`, request, buildHeader(token));
}
