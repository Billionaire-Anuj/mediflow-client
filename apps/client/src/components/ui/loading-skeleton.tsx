import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
    className?: string;
    lines?: number;
}

export function LoadingSkeleton({ className, lines = 3 }: LoadingSkeletonProps) {
    return (
        <div className={cn("space-y-3 animate-pulse", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className={cn("h-4 rounded bg-muted", i === lines - 1 && "w-3/4")} />
            ))}
        </div>
    );
}

export function CardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn("p-6 rounded-lg border border-border bg-card animate-pulse", className)}>
            <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
            </div>
            <LoadingSkeleton lines={2} />
        </div>
    );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 rounded bg-muted" />
                </td>
            ))}
        </tr>
    );
}

export function ListSkeleton({ items = 5, className }: { items?: number; className?: string }) {
    return (
        <div className={cn("space-y-4", className)}>
            {Array.from({ length: items }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}
