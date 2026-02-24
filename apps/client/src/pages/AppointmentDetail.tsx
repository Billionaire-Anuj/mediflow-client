import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppointmentService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ArrowLeft, Calendar, Clock, User, Stethoscope, Pill, FlaskConical, FileText } from "lucide-react";
import { format } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";

export default function AppointmentDetail() {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["appointment", appointmentId],
        enabled: !!appointmentId,
        queryFn: async () => AppointmentService.getAppointmentById({ appointmentId: appointmentId! })
    });

    const appointment = data?.result;
    const start = combineDateAndTime(appointment?.timeslot?.date, appointment?.timeslot?.startTime);
    const end = combineDateAndTime(appointment?.timeslot?.date, appointment?.timeslot?.endTime);

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

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Overview</CardTitle>
                    <StatusBadge variant={getStatusVariant(appointment.status || "scheduled")}>
                        {appointment.status}
                    </StatusBadge>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                        {start && (
                            <span className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {format(start, "MMM d, yyyy")}
                            </span>
                        )}
                        {start && (
                            <span className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {format(start, "h:mm a")}
                                {end ? ` - ${format(end, "h:mm a")}` : ""}
                            </span>
                        )}
                        {appointment.bookedDate && (
                            <span className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Booked: {format(new Date(appointment.bookedDate), "MMM d, yyyy")}
                            </span>
                        )}
                    </div>
                    {appointment.notes && (
                        <div>
                            <p className="text-sm font-medium">Notes</p>
                            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                        </div>
                    )}
                    {appointment.symptoms && (
                        <div>
                            <p className="text-sm font-medium">Symptoms</p>
                            <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
                        </div>
                    )}
                    {appointment.fee !== undefined && (
                        <div>
                            <p className="text-sm font-medium">Consultation Fee</p>
                            <p className="text-sm text-muted-foreground">${appointment.fee}</p>
                        </div>
                    )}
                    {(appointment.isPaidViaGateway || appointment.isPaidViaOfflineMedium) && (
                        <div>
                            <p className="text-sm font-medium">Payment Method</p>
                            <p className="text-sm text-muted-foreground">
                                {appointment.isPaidViaGateway ? "Online payment" : "Offline payment"}
                            </p>
                        </div>
                    )}
                    {appointment.cancellationReason && (
                        <div>
                            <p className="text-sm font-medium">Cancellation Reason</p>
                            <p className="text-sm text-muted-foreground">{appointment.cancellationReason}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Doctor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Stethoscope className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">{appointment.doctor?.name}</p>
                                <p className="text-sm text-muted-foreground">{appointment.doctor?.emailAddress}</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {(appointment.doctor?.specializations || [])
                                .map((spec) => spec.title)
                                .filter(Boolean)
                                .join(", ") || "General Practitioner"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Patient</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">{appointment.patient?.name}</p>
                                <p className="text-sm text-muted-foreground">{appointment.patient?.emailAddress}</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{appointment.patient?.phoneNumber}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
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

                <Card>
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
            </div>

            {appointment.medicalRecords && (
                <Card>
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
    );
}
