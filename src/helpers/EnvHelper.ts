export function envVal<T>(devValue: T, prodValue: T): T {
    if (process.env.NODE_ENV === "development") {
        return devValue;
    } else {
        return prodValue;
    }
}
