"use client";
import { useSearchParams } from "next/navigation";

export function useUrlQuery() {
    return useSearchParams();
}
