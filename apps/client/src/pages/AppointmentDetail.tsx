import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppointmentService, PatientService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { RatingStars } from "@/components/ui/rating";
import { ArrowLeft, Calendar, Clock, Stethoscope, Pill, FlaskConical, FileText } from "lucide-react";
import { format } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";
import { toast } from "sonner";
import { getErrorMessage, getResponseMessage } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AppointmentDetail() {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["appointment", appointmentId],
        enabled: !!appointmentId,
        queryFn: async () => AppointmentService.getAppointmentById({ appointmentId: appointmentId! })
    });

    const { data: profileData } = useQuery({
        queryKey: ["patient-profile"],
        queryFn: async () => PatientService.getPatientProfile()
    });

    const appointment = data?.result;
    const start = combineDateAndTime(appointment?.timeslot?.date, appointment?.timeslot?.startTime);
    const end = combineDateAndTime(appointment?.timeslot?.date, appointment?.timeslot?.endTime);
    const doctorReviewCount = appointment?.doctor?.reviewCount ?? 0;
    const doctorAverageRating = appointment?.doctor?.averageRating ?? 0;
    const creditPoints = profileData?.result?.creditPoints ?? 0;
    const isPaid = appointment?.isPaidViaGateway || appointment?.isPaidViaOfflineMedium;
    const paymentLabel = appointment?.isPaidViaGateway
        ? "Paid via Credits"
        : appointment?.isPaidViaOfflineMedium
          ? "Paid Offline"
          : "Unpaid";
    const canPayWithCredits =
        !!appointment &&
        !isPaid &&
        appointment.status !== "Canceled" &&
        (appointment.fee ?? 0) > 0 &&
        creditPoints >= (appointment.fee ?? 0);

    const payWithCreditsMutation = useMutation({
        mutationFn: async () =>
            AppointmentService.payAppointmentWithCredits({ appointmentId: appointmentId! }),
        onSuccess: (response) => {
            toast.success(getResponseMessage(response));
            queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
            queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const cancelMutation = useMutation({
        mutationFn: async () =>
            AppointmentService.cancelAppointment({
                appointmentId: appointmentId!,
                requestBody: {
                    appointmentId: appointmentId!,
                    cancellationReason: cancellationReason || undefined
                }
            }),
        onSuccess: (response) => {
            toast.success(getResponseMessage(response));
            setCancelDialogOpen(false);
            setCancellationReason("");
            queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
            queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Appointment Details" />
                <CardSkeleton />
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="space-y-6">
                <PageHeader title="Appointment Not Found" />
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <PageHeader title="Appointment Details" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Notes & Symptoms</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            {appointment.notes ? <p>{appointment.notes}</p> : <p>No notes recorded.</p>}
                            {appointment.cancellationReason && (
                                <p>Cancellation Reason: {appointment.cancellationReason}</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Care Team</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Stethoscope className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{appointment.doctor?.name}</p>
                                    <p className="text-sm text-muted-foreground">{appointment.doctor?.emailAddress}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {(appointment.doctor?.specializations || [])
                                            .map((spec) => spec.title)
                                            .filter(Boolean)
                                            .join(", ") || "General Practitioner"}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <RatingStars rating={doctorAverageRating} />
                                        <span>
                                            {doctorReviewCount > 0
                                                ? `${doctorAverageRating.toFixed(1)} (${doctorReviewCount} reviews)`
                                                : "No reviews yet"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Medications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {appointment.medications?.length ? (
                                appointment.medications.map((med) => (
                                    <div key={med.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Medication Order</span>
                                            <StatusBadge variant={getStatusVariant(med.status || "pending")}>
                                                {med.status}
                                            </StatusBadge>
                                        </div>
                                        <div className="space-y-2">
                                            {(med.drugs || []).map((drug) => (
                                                <div key={drug.id} className="text-sm">
                                                    <Pill className="inline h-3 w-3 mr-1" />
                                                    {drug.medicine?.title} {drug.dose}
                                                    <span className="text-muted-foreground">
                                                        {" "}
                                                        • {drug.frequency} • {drug.duration}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No medications recorded.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Diagnostics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {appointment.diagnostics?.length ? (
                                appointment.diagnostics.map((diag) => (
                                    <div key={diag.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Lab Request</span>
                                            <StatusBadge variant={getStatusVariant(diag.status || "scheduled")}>
                                                {diag.status}
                                            </StatusBadge>
                                        </div>
                                        <div className="space-y-2">
                                            {(diag.diagnosticTests || []).map((test) => (
                                                <div key={test.id} className="text-sm">
                                                    <FlaskConical className="inline h-3 w-3 mr-1" />
                                                    {test.diagnosticTest?.title}
                                                    {test.result?.value && (
                                                        <span className="text-muted-foreground">
                                                            {" "}
                                                            • {test.result.value} {test.result.unit}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No diagnostics recorded.</p>
                            )}
                        </CardContent>
                    </Card>

                    {appointment.medicalRecords && (
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">Medical Records</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {appointment.medicalRecords.diagnosis && (
                                    <p className="text-sm">
                                        <span className="font-medium">Diagnosis:</span> {appointment.medicalRecords.diagnosis}
                                    </p>
                                )}
                                {appointment.medicalRecords.treatment && (
                                    <p className="text-sm">
                                        <span className="font-medium">Treatment:</span> {appointment.medicalRecords.treatment}
                                    </p>
                                )}
                                {appointment.medicalRecords.prescriptions && (
                                    <p className="text-sm">
                                        <span className="font-medium">Prescriptions:</span>{" "}
                                        {appointment.medicalRecords.prescriptions}
                                    </p>
                                )}
                                {appointment.medicalRecords.notes && (
                                    <p className="text-sm text-muted-foreground">{appointment.medicalRecords.notes}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Summary</CardTitle>
                            <StatusBadge variant={getStatusVariant(appointment.status || "scheduled")}>
                                {appointment.status}
                            </StatusBadge>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            {start && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {format(start, "MMMM d, yyyy")}
                                </div>
                            )}
                            {start && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {format(start, "h:mm a")}
                                    {end ? ` - ${format(end, "h:mm a")}` : ""}
                                </div>
                            )}
                            {appointment.bookedDate && (
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Booked: {format(new Date(appointment.bookedDate), "MMM d, yyyy")}
                                </div>
                            )}
                            <div className="rounded-lg border border-border/60 px-3 py-2">
                                Fee: NPR {appointment.fee?.toFixed(2) ?? "0.00"}
                            </div>
                            {appointment.status === "Scheduled" && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setCancelDialogOpen(true)}
                                >
                                    Cancel Appointment
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <span
                                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                                        isPaid
                                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                                            : "border-amber-100 bg-amber-50 text-amber-700"
                                    }`}
                                >
                                    {paymentLabel}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>Available credits</span>
                                <span>{creditPoints.toFixed(2)}</span>
                            </div>
                            {!isPaid && (appointment.fee ?? 0) > 0 && (
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!canPayWithCredits || payWithCreditsMutation.isPending}
                                        onClick={() => payWithCreditsMutation.mutate()}
                                    >
                                        {payWithCreditsMutation.isPending ? "Processing..." : "Pay with Credits"}
                                    </Button>
                                    {!canPayWithCredits && (
                                        <p className="text-xs text-muted-foreground">
                                            Not enough credits to complete payment.
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Appointment</DialogTitle>
                        <DialogDescription>Provide a reason for cancelling this appointment.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label>Cancellation Reason</Label>
                            <Input
                                placeholder="Add a short reason"
                                value={cancellationReason}
                                onChange={(event) => setCancellationReason(event.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                                Close
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => cancelMutation.mutate()}
                                disabled={cancelMutation.isPending}
                            >
                                {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancel"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
