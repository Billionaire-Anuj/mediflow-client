import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppointmentDiagnosticsService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { FlaskConical, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function LabDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ["lab-requests"],
        queryFn: async () => AppointmentDiagnosticsService.getAllAppointmentDiagnosticsList({})
    });

    const stats = useMemo(() => {
        let pending = 0;
        let inProgress = 0;
        let completed = 0;
        let urgent = 0;

        (data?.result ?? []).forEach((apt) => {
            (apt.diagnostics || []).forEach((diag) => {
                if (diag.status === "Resulted") {
                    completed += 1;
                } else if (diag.status === "Collected") {
                    inProgress += 1;
                } else {
                    pending += 1;
                }
                if (diag.status === "Cancelled") {
                    urgent += 1;
                }
            });
        });

        return {
            pendingRequests: pending,
            inProgress,
            completedToday: completed,
            urgentPending: urgent
        };
    }, [data]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Lab Dashboard" />
                <ListSkeleton items={4} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Lab Dashboard" description="Manage lab requests and results" />

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-warning-bg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-status-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-info-bg flex items-center justify-center">
                            <FlaskConical className="h-6 w-6 text-status-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.inProgress}</p>
                            <p className="text-sm text-muted-foreground">In Progress</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-success-bg flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-status-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.completedToday}</p>
                            <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-danger-bg flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-status-danger" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.urgentPending}</p>
                            <p className="text-sm text-muted-foreground">Cancelled</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
