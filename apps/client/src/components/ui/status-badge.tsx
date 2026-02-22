import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                success: "bg-status-success-bg text-status-success-foreground",
                warning: "bg-status-warning-bg text-status-warning-foreground",
                danger: "bg-status-danger-bg text-status-danger-foreground",
                info: "bg-status-info-bg text-status-info-foreground",
                neutral: "bg-muted text-muted-foreground"
            }
        },
        defaultVariants: {
            variant: "neutral"
        }
    }
);

export interface StatusBadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusBadgeVariants> {
    children: React.ReactNode;
}

export function StatusBadge({ className, variant, children, ...props }: StatusBadgeProps) {
    return (
        <span className={cn(statusBadgeVariants({ variant }), className)} {...props}>
            {children}
        </span>
    );
}

// Helper to map common statuses to variants
export function getStatusVariant(status: string): StatusBadgeProps["variant"] {
    const statusMap: Record<string, StatusBadgeProps["variant"]> = {
        // Appointments
        scheduled: "info",
        completed: "success",
        canceled: "danger",
        cancelled: "danger",

        // Prescriptions
        created: "info",
        pending: "warning",
        "partially-dispensed": "warning",
        dispensed: "success",

        // Lab
        appointed: "info",
        collected: "warning",
        resulted: "success",
        scheduled: "info",
        cancelled: "danger",

        // Users
        active: "success",
        inactive: "neutral",
        suspended: "danger",

        // Priority
        routine: "neutral",
        urgent: "warning",
        stat: "danger",

        // Doctor status
        available: "success",
        busy: "warning",
        offline: "neutral"
    };

    return statusMap[status.toLowerCase()] || "neutral";
}
