import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppointmentDiagnosticsService, type AppointmentDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search,
    FlaskConical,
    Clock,
    User,
    ArrowRight,
    ClipboardList,
    CheckCircle2,
    AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";
import { getAvatarUrl } from "@/lib/auth";

interface LabRequestItem {
    id: string;
    appointment: AppointmentDto;
    status?: string | null;
    testNames: string[];
    assignedName?: string;
}

export default function LabRequests() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data, isLoading } = useQuery({
        queryKey: ["lab-requests"],
        queryFn: async () => AppointmentDiagnosticsService.getAllAppointmentDiagnosticsList({})
    });

    const requests = useMemo<LabRequestItem[]>(() => {
        const appointments = data?.result ?? [];
        const items: LabRequestItem[] = [];
        appointments.forEach((apt) => {
            (apt.diagnostics || []).forEach((diag) => {
                if (!diag.id) return;
                items.push({
                    id: diag.id,
                    appointment: apt,
                    status: diag.status,
                    testNames: (diag.diagnosticTests || []).map((t) => t.diagnosticTest?.title || "") || [],
                    assignedName:
                        diag.labTechnician?.name ||
                        diag.labTechnician?.username ||
                        diag.labTechnician?.emailAddress ||
                        undefined
                });
            });
        });
        return items;
    }, [data]);

    const filteredRequests = requests.filter((req) => {
        const patientName = req.appointment.patient?.name?.toLowerCase() || "";
        const doctorName = req.appointment.doctor?.name?.toLowerCase() || "";
        const matchesSearch =
            patientName.includes(searchQuery.toLowerCase()) || doctorName.includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = useMemo(() => {
        const total = requests.length;
        const resulted = requests.filter((req) => req.status === "Resulted").length;
        const cancelled = requests.filter((req) => req.status === "Cancelled").length;
        const pending = total - resulted - cancelled;
        const assigned = requests.filter((req) => !!req.assignedName).length;
        return { total, resulted, cancelled, pending, assigned };
    }, [requests]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Lab Requests" />
                <ListSkeleton items={4} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm">
                <PageHeader title="Lab Requests" description="Manage and process lab test requests" />
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-emerald-100 bg-white/80 shadow-none">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
                                <p className="text-2xl font-semibold">{stats.total}</p>
                            </div>
                            <ClipboardList className="h-5 w-5 text-primary" />
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-100 bg-white/80 shadow-none">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Pending</p>
                                <p className="text-2xl font-semibold">{stats.pending}</p>
                            </div>
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-100 bg-white/80 shadow-none">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Resulted</p>
                                <p className="text-2xl font-semibold">{stats.resulted}</p>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-100 bg-white/80 shadow-none">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Assigned</p>
                                <p className="text-2xl font-semibold">{stats.assigned}</p>
                            </div>
                            <User className="h-5 w-5 text-primary" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by patient or doctor..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Appointed">Appointed</SelectItem>
                                <SelectItem value="Resulted">Resulted</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Showing {filteredRequests.length} of {requests.length} lab requests
                    </div>
                </CardContent>
            </Card>

            {filteredRequests.length === 0 ? (
                <EmptyState icon={FlaskConical} title="No requests found" description="Try adjusting your filters" />
            ) : (
                <div className="space-y-3">
                    {filteredRequests.map((req) => {
                        const start = combineDateAndTime(
                            req.appointment.timeslot?.date,
                            req.appointment.timeslot?.startTime
                        );
                        return (
                            <Card key={req.id} className="card-interactive border-primary/10">
                                <CardContent className="p-4">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex gap-4">
                                            <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                                                <AvatarImage
                                                    src={getAvatarUrl(req.appointment.patient?.profileImage?.fileUrl)}
                                                    alt={req.appointment.patient?.name || "Patient"}
                                                />
                                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                    {(req.appointment.patient?.name || "P")
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-semibold">{req.appointment.patient?.name}</h3>
                                                    {req.status === "Resulted" && (
                                                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                                                            Resulted
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Ordered by {req.appointment.doctor?.name}
                                                </p>
                                                {req.assignedName && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Assigned to {req.assignedName}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {start ? format(start, "MMM d, yyyy h:mm a") : ""}
                                                </div>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {req.testNames.slice(0, 2).map((name, idx) => (
                                                        <span
                                                            key={`${req.id}-${idx}`}
                                                            className="px-2 py-0.5 bg-accent rounded text-xs"
                                                        >
                                                            {name}
                                                        </span>
                                                    ))}
                                                    {req.testNames.length > 2 && (
                                                        <span className="px-2 py-0.5 bg-muted rounded text-xs">
                                                            +{req.testNames.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <StatusBadge variant={getStatusVariant(req.status || "scheduled")}>
                                                {req.status}
                                            </StatusBadge>
                                            <Button size="sm" asChild>
                                                <Link to={`/lab/request/${req.id}`}>
                                                    Open <ArrowRight className="h-4 w-4 ml-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
