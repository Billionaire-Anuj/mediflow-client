import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";

export default function AdminReports() {
    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Reports" description="Reporting is not available yet" />
            <EmptyState
                icon={BarChart3}
                title="No report data"
                description="Connect reporting endpoints to view analytics."
            />
        </div>
    );
}
