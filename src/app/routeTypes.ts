export interface PageInfo {
    pageKey: string;
    pageTitle: string;
}

export interface RouteHandle {
    title?: (loaderData?: unknown) => string;
    pageInfo?: (loaderData?: unknown) => PageInfo;
}
