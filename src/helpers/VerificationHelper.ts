export function isVerificationCodeExpired(expiresAt: string | undefined, now = Date.now()): boolean {
    if (!expiresAt) return true;
    const expiration = Date.parse(expiresAt);
    return !Number.isFinite(expiration) || expiration <= now;
}
