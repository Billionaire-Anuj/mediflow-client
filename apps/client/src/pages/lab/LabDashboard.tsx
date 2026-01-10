import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { mockLabRequests } from "@/mock/labRequests";
import { mockDashboardStats } from "@/mock/config";
import { FlaskConical, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function LabDashboard() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState(mockLabRequests);
    const stats = mockDashboardStats.lab;

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(timer);
    }, []);

    const updateStatus = (id: string, status: "in-progress" | "completed") => {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        toast.success(`Request marked as ${status}`);
    };

    if (loading)
        return (
            <div className="space-y-6">
                <PageHeader title="Lab Dashboard" />
                <ListSkeleton items={4} />
            </div>
        );

    const pending = requests.filter((r) => r.status === "requested");

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
                            <p className="text-sm text-muted-foreground">Completed Today</p>
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
                            <p className="text-sm text-muted-foreground">Urgent</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Pending Requests</h3>
                    <div className="space-y-3">
                        {pending.map((req) => (
                            <div key={req.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                                <div>
                                    <p className="font-medium">{req.patientName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {req.tests.map((t) => t.name).join(", ")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(req.createdAt), "MMM d, h:mm a")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge variant={getStatusVariant(req.priority)}>{req.priority}</StatusBadge>
                                    <Button size="sm" onClick={() => updateStatus(req.id, "in-progress")}>
                                        Start
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {pending.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No pending requests</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
