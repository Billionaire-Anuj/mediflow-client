import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppointmentMedicationsService, type AppointmentDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Pill, Clock, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface PrescriptionItem {
    id: string;
    appointment: AppointmentDto;
    status?: string | null;
    itemCount: number;
    items: string[];
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
                        .filter(Boolean)
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
            <PageHeader title="Prescriptions" description="Manage and dispense prescriptions" />

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
                        <SelectItem value="Collected">Collected</SelectItem>
                        <SelectItem value="Resulted">Resulted</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {filteredPrescriptions.length === 0 ? (
                <EmptyState icon={Pill} title="No prescriptions found" description="Try adjusting your filters" />
            ) : (
                <div className="space-y-3">
                    {filteredPrescriptions.map((rx) => (
                        <Card key={rx.id} className="card-interactive">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{rx.appointment.patient?.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Prescribed by {rx.appointment.doctor?.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {rx.appointment.bookedDate
                                                    ? format(new Date(rx.appointment.bookedDate), "MMM d, yyyy h:mm a")
                                                    : ""}
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {rx.items.slice(0, 2).map((item, idx) => (
                                                    <span key={`${rx.id}-${idx}`} className="px-2 py-0.5 bg-accent rounded text-xs">
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
                                    <div className="flex items-center gap-3">
                                        <StatusBadge variant={getStatusVariant(rx.status || "pending")}>{rx.status}</StatusBadge>
                                        <Button size="sm" asChild>
                                            <Link to={`/pharmacy/prescription/${rx.id}`}>
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
