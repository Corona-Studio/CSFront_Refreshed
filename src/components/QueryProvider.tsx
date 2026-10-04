"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

/** Account and download routes share a cache without shipping it to marketing pages. */
export default function QueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } }
            })
    );
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
