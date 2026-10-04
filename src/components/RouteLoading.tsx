import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="m-container py-16 space-y-6" role="status" aria-label="正在加载">
            <Skeleton className="h-12 w-1/2 rounded-none" />
            <Skeleton className="h-72 w-full rounded-none" />
        </div>
    );
}
