import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell } from "lucide-react";

export default function PatientNotifications() {
    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Notifications" description="Stay updated on your appointments and results" />
            <EmptyState
                icon={Bell}
                title="No notifications"
                description="Notifications will appear here once available."
            />
        </div>
    );
}
