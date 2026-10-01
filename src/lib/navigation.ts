"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useNavigate() {
    const router = useRouter();
    return useCallback(
        (path: string, options?: { replace?: boolean }) => {
            if (options?.replace) router.replace(path);
            else router.push(path);
        },
        [router]
    );
}
