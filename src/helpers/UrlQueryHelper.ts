import { useMemo } from "react";
import { useLocation } from "react-router";

export function useUrlQuery() {
    const { search } = useLocation();

    return useMemo(() => new URLSearchParams(search), [search]);
}
