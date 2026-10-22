import StructuredData from "@/components/StructuredData";
import Home from "@/features/Home";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/");
export default function RoutePage() {
    return (
        <>
            <StructuredData path="/" />
            <Home />
        </>
    );
}
