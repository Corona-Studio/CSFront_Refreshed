import { Suspense } from "react";
import RouteLoading from "@/components/RouteLoading";
import QueryProvider from "@/components/QueryProvider";
import ConsoleShell from "@/components/marathon/console-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<RouteLoading />}>
            <QueryProvider>
                <ConsoleShell admin>{children}</ConsoleShell>
            </QueryProvider>
        </Suspense>
    );
}
