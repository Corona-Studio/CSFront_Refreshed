import Page from "@/features/Home";
import { Suspense } from "react";

export const metadata = { title: "日冕工作室" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
