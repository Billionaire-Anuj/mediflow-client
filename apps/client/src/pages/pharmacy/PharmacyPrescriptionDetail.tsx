import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AppointmentMedicationsService,
    type AppointmentDto,
    type AppointmentMedicationsDto
} from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Pill, Loader2, Calendar, Clock, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { getErrorMessage, getResponseMessage } from "@/lib/api";
import { getAvatarUrl } from "@/lib/auth";
import { combineDateAndTime } from "@/lib/datetime";

interface PrescriptionDetail {
    appointment: AppointmentDto;
    medication: AppointmentMedicationsDto;
}

export default function PharmacyPrescriptionDetail() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const [justDispensed, setJustDispensed] = useState(false);

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
        mutationFn: async () =>
            AppointmentMedicationsService.dispenseAppointmentMedications({
                appointmentMedicationsId: id!
            }),
        onSuccess: (data) => {
            toast.success(getResponseMessage(data));
            setJustDispensed(true);
            queryClient.invalidateQueries({ queryKey: ["pharmacy-prescriptions"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
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
                    <Link to="/pharmacist/prescriptions">Back to Prescriptions</Link>
                </Button>
            </div>
        );
    }

    const { appointment, medication } = prescription;
    const assignedPharmacist =
        medication.pharmacist?.name || medication.pharmacist?.username || medication.pharmacist?.emailAddress;
    const isDispensed = medication.status === "Collected" || justDispensed;
    const start = combineDateAndTime(appointment.timeslot?.date, appointment.timeslot?.startTime);

    useEffect(() => {
        if (medication.status !== "Collected") {
            setJustDispensed(false);
        }
    }, [medication.status]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/pharmacist/prescriptions">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <PageHeader
                    title={`Prescription #${medication.id?.slice(-4)}`}
                    description={appointment.bookedDate ? format(new Date(appointment.bookedDate), "MMMM d, yyyy") : ""}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-base">Prescription Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                                <AvatarImage
                                    src={getAvatarUrl(appointment.patient?.profileImage?.fileUrl)}
                                    alt={appointment.patient?.name || "Patient"}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                    {(appointment.patient?.name || "P")
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{appointment.patient?.name}</p>
                                <p className="text-sm text-muted-foreground">Patient</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Stethoscope className="h-4 w-4" />
                                <span>Prescribed by {appointment.doctor?.name || "Doctor"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>Assigned pharmacist: {assignedPharmacist || "Unassigned"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {appointment.bookedDate
                                        ? format(new Date(appointment.bookedDate), "MMM d, yyyy")
                                        : ""}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{start ? format(start, "h:mm a") : ""}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge variant={getStatusVariant(medication.status || "pending")}>
                                {medication.status}
                            </StatusBadge>
                            {isDispensed && (
                                <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Dispensed</Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-base">Medication Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {(medication.drugs || []).map((item) => (
                                <div key={item.id} className="flex items-start justify-between p-4 border rounded-xl">
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

                        <div className="rounded-xl border bg-muted/20 p-4">
                            <p className="text-sm text-muted-foreground">Pharmacy Notes</p>
                            <p className="text-sm">{medication.notes || "No notes"}</p>
                        </div>

                        <Button
                            className="w-full"
                            onClick={() => dispenseMutation.mutate()}
                            disabled={dispenseMutation.isPending || isDispensed}
                        >
                            {dispenseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Pill className="h-4 w-4 mr-2" />
                            {isDispensed ? "Already Dispensed" : "Mark as Dispensed"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
