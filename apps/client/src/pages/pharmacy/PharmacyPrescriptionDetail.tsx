import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppointmentMedicationsService, type AppointmentDto, type AppointmentMedicationsDto } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ArrowLeft, User, Pill, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface PrescriptionDetail {
    appointment: AppointmentDto;
    medication: AppointmentMedicationsDto;
}

export default function PharmacyPrescriptionDetail() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["pharmacy-prescriptions"],
        queryFn: async () => AppointmentMedicationsService.getAllAppointmentMedicationsList({})
    });

    const prescription = useMemo<PrescriptionDetail | null>(() => {
        const appointments = data?.result ?? [];
        for (const apt of appointments) {
            for (const med of apt.medications || []) {
                if (med.id === id) {
                    return { appointment: apt, medication: med };
                }
            }
        }
        return null;
    }, [data, id]);

    const dispenseMutation = useMutation({
        mutationFn: async () => AppointmentMedicationsService.dispenseAppointmentMedications({
            appointmentMedicationsId: id!
        }),
        onSuccess: () => {
            toast.success("Prescription dispensed successfully");
            queryClient.invalidateQueries({ queryKey: ["pharmacy-prescriptions"] });
        },
        onError: () => toast.error("Failed to dispense prescription")
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Prescription" />
                <CardSkeleton />
            </div>
        );
    }

    if (!prescription) {
        return (
            <div className="space-y-6">
                <PageHeader title="Prescription Not Found" />
                <Button asChild>
                    <Link to="/pharmacy/prescriptions">Back to Prescriptions</Link>
                </Button>
            </div>
        );
    }

    const { appointment, medication } = prescription;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/pharmacy/prescriptions">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <PageHeader
                    title={`Prescription #${medication.id?.slice(-4)}`}
                    description={appointment.bookedDate ? format(new Date(appointment.bookedDate), "MMMM d, yyyy") : ""}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Prescription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">{appointment.patient?.name}</p>
                                <p className="text-sm text-muted-foreground">Patient</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Prescribed by</span>
                                <span>{appointment.doctor?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date</span>
                                <span>
                                    {appointment.bookedDate ? format(new Date(appointment.bookedDate), "MMM d, yyyy") : ""}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <StatusBadge variant={getStatusVariant(medication.status || "pending")}>
                                    {medication.status}
                                </StatusBadge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Medications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {(medication.drugs || []).map((item) => (
                                <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">
                                            {item.medicine?.title} {item.dose}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.frequency} • {item.duration}
                                        </p>
                                        {item.instructions && (
                                            <p className="text-xs text-muted-foreground mt-1 italic">
                                                {item.instructions}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Pharmacy Notes</p>
                            <p className="text-sm">{medication.notes || "No notes"}</p>
                        </div>

                        <Button className="w-full" onClick={() => dispenseMutation.mutate()} disabled={dispenseMutation.isPending}>
                            {dispenseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Pill className="h-4 w-4 mr-2" />
                            Mark as Dispensed
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
