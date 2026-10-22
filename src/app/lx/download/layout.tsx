import type { ReactNode } from "react";

import QueryProvider from "@/components/QueryProvider";

export default function Layout({ children }: { children: ReactNode }) {
    return <QueryProvider>{children}</QueryProvider>;
}
