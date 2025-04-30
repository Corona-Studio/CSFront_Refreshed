export function envVal<T>(devValue: T, prodValue: T): T {
    if (import.meta.env.MODE === "development") {
        return devValue;
    } else {
        return prodValue;
    }
}
