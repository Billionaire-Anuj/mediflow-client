import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppointmentMedicationsService, type AppointmentDto } from "@mediflow/mediflow-api";
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
import { Search, Pill, Clock, User, ArrowRight, ClipboardList, CheckCircle2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { getAvatarUrl } from "@/lib/auth";

interface PrescriptionItem {
    id: string;
    appointment: AppointmentDto;
    status?: string | null;
    itemCount: number;
    items: string[];
    assignedName?: string;
}

export default function PharmacyPrescriptions() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data, isLoading } = useQuery({
        queryKey: ["pharmacy-prescriptions"],
        queryFn: async () => AppointmentMedicationsService.getAllAppointmentMedicationsList({})
    });

    const prescriptions = useMemo<PrescriptionItem[]>(() => {
        const list: PrescriptionItem[] = [];
        (data?.result ?? []).forEach((apt) => {
            (apt.medications || []).forEach((med) => {
                if (!med.id) return;
                list.push({
                    id: med.id,
                    appointment: apt,
                    status: med.status,
                    itemCount: med.drugs?.length || 0,
                    items: (med.drugs || [])
                        .map((drug) => `${drug.medicine?.title || "Medicine"} ${drug.dose || ""}`.trim())
                        .filter(Boolean),
                    assignedName:
                        med.pharmacist?.name || med.pharmacist?.username || med.pharmacist?.emailAddress || undefined
                });
            });
        });
        return list;
    }, [data]);

    const filteredPrescriptions = prescriptions.filter((rx) => {
        const matchesSearch =
            rx.appointment.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rx.appointment.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || rx.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = useMemo(() => {
        const total = prescriptions.length;
        const dispensed = prescriptions.filter((rx) => rx.status === "Collected").length;
        const cancelled = prescriptions.filter((rx) => rx.status === "Cancelled").length;
        const pending = total - dispensed - cancelled;
        const assigned = prescriptions.filter((rx) => !!rx.assignedName).length;
        return { total, dispensed, cancelled, pending, assigned };
    }, [prescriptions]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Prescriptions" />
                <ListSkeleton items={4} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 shadow-sm">
                <PageHeader title="Prescriptions" description="Manage and dispense prescriptions" />
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
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Dispensed</p>
                                <p className="text-2xl font-semibold">{stats.dispensed}</p>
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
                                <SelectItem value="Collected">Dispensed</SelectItem>
                                <SelectItem value="Resulted">Resulted</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
                    </div>
                </CardContent>
            </Card>

            {filteredPrescriptions.length === 0 ? (
                <EmptyState icon={Pill} title="No prescriptions found" description="Try adjusting your filters" />
            ) : (
                <div className="space-y-3">
                    {filteredPrescriptions.map((rx) => (
                        <Card key={rx.id} className="card-interactive border-primary/10">
                            <CardContent className="p-4">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex gap-4">
                                        <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                                            <AvatarImage
                                                src={getAvatarUrl(rx.appointment.patient?.profileImage?.fileUrl)}
                                                alt={rx.appointment.patient?.name || "Patient"}
                                            />
                                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                {(rx.appointment.patient?.name || "P")
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold">{rx.appointment.patient?.name}</h3>
                                                {rx.status === "Collected" && (
                                                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                                                        Dispensed
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Prescribed by {rx.appointment.doctor?.name}
                                            </p>
                                            {rx.assignedName && (
                                                <p className="text-xs text-muted-foreground">
                                                    Assigned pharmacist: {rx.assignedName}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {rx.appointment.bookedDate
                                                    ? format(new Date(rx.appointment.bookedDate), "MMM d, yyyy h:mm a")
                                                    : ""}
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {rx.items.slice(0, 2).map((item, idx) => (
                                                    <span
                                                        key={`${rx.id}-${idx}`}
                                                        className="px-2 py-0.5 bg-accent rounded text-xs"
                                                    >
                                                        {item}
                                                    </span>
                                                ))}
                                                {rx.items.length > 2 && (
                                                    <span className="px-2 py-0.5 bg-muted rounded text-xs">
                                                        +{rx.items.length - 2} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <StatusBadge variant={getStatusVariant(rx.status || "pending")}>
                                            {rx.status}
                                        </StatusBadge>
                                        <Button size="sm" asChild>
                                            <Link to={`/pharmacist/prescription/${rx.id}`}>
                                                Open <ArrowRight className="h-4 w-4 ml-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
