export function IsDebug(): boolean {
    return window.location.hash.includes('debug') || window.location.search.includes('debug');
}