export function isVerificationCodeExpired(expiresAt: string | undefined, now = Date.now()): boolean {
    if (!expiresAt) return true;
    // Older API responses may omit the UTC suffix after reading from SQLite.
    const normalized = /(?:Z|[+-]\d{2}:\d{2})$/i.test(expiresAt) ? expiresAt : `${expiresAt}Z`;
    const expiration = Date.parse(normalized);
    return !Number.isFinite(expiration) || expiration <= now;
}
