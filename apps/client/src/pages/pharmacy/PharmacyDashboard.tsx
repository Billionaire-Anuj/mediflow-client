import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppointmentMedicationsService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { Pill, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PharmacyDashboard() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["pharmacy-prescriptions"],
        queryFn: async () => AppointmentMedicationsService.getAllAppointmentMedicationsList({})
    });

    const prescriptions = useMemo(() => {
        const list: {
            id: string;
            appointmentId?: string;
            patientName?: string;
            doctorName?: string;
            status?: string | null;
            itemCount: number;
            createdAt?: string;
        }[] = [];
        (data?.result ?? []).forEach((apt) => {
            (apt.medications || []).forEach((med) => {
                if (!med.id) return;
                list.push({
                    id: med.id,
                    appointmentId: apt.id,
                    patientName: apt.patient?.name,
                    doctorName: apt.doctor?.name,
                    status: med.status,
                    itemCount: med.drugs?.length || 0,
                    createdAt: apt.bookedDate || apt.timeslot?.date
                });
            });
        });
        return list;
    }, [data]);

    const dispenseMutation = useMutation({
        mutationFn: async (medicationId: string) =>
            AppointmentMedicationsService.dispenseAppointmentMedications({
                appointmentMedicationsId: medicationId
            }),
        onSuccess: () => {
            toast.success("Prescription dispensed");
            queryClient.invalidateQueries({ queryKey: ["pharmacy-prescriptions"] });
        },
        onError: () => toast.error("Failed to dispense prescription")
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Pharmacy Dashboard" />
                <ListSkeleton items={4} />
            </div>
        );
    }

    const pending = prescriptions.filter((p) => p.status !== "Resulted");
    const dispensed = prescriptions.filter((p) => p.status === "Resulted");

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Pharmacy Dashboard" description="Manage prescriptions and dispensing" />

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-warning-bg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-status-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{pending.length}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-info-bg flex items-center justify-center">
                            <Pill className="h-6 w-6 text-status-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{dispensed.length}</p>
                            <p className="text-sm text-muted-foreground">Dispensed</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-success-bg flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-status-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{dispensed.length}</p>
                            <p className="text-sm text-muted-foreground">Dispensed</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-status-danger-bg flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-status-danger" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">0</p>
                            <p className="text-sm text-muted-foreground">Low Stock</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Pending Prescriptions</h3>
                    <div className="space-y-3">
                        {pending.map((rx) => (
                            <div key={rx.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                                <div>
                                    <p className="font-medium">{rx.patientName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {rx.itemCount} item(s) • {rx.doctorName}
                                    </p>
                                    {rx.createdAt && (
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(rx.createdAt), "MMM d, h:mm a")}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge variant={getStatusVariant(rx.status || "pending")}>{rx.status}</StatusBadge>
                                    <Button size="sm" onClick={() => dispenseMutation.mutate(rx.id)}>
                                        Dispense
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {pending.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No pending prescriptions</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
