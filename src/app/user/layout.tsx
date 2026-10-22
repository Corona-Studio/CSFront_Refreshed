import { Suspense } from "react";

import { noIndex } from "@/lib/seo";
export const metadata = noIndex;
import ConsoleShell from "@/components/marathon/console-shell";
import QueryProvider from "@/components/QueryProvider";
import RouteLoading from "@/components/RouteLoading";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<RouteLoading />}>
            <QueryProvider>
                <ConsoleShell>{children}</ConsoleShell>
            </QueryProvider>
        </Suspense>
    );
}
