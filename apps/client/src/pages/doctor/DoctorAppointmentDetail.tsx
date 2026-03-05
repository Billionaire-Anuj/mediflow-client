import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppointmentService, AppointmentStatus } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Clock, FileText, FlaskConical, Pill, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";
import { getAvatarUrl, getDiagnosticReportUrl } from "@/lib/auth";

export default function DoctorAppointmentDetail() {
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

    const isPaid = appointment?.isPaidViaGateway || appointment?.isPaidViaOfflineMedium;
    const paymentLabel = appointment?.isPaidViaGateway
        ? "Paid via Credits"
        : appointment?.isPaidViaOfflineMedium
          ? "Paid Offline"
          : "Unpaid";

    const patientInitials =
        appointment?.patient?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2) || "P";

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
                <PageHeader title="Appointment Overview" description={appointment.id} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <div className="space-y-6">
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Patient</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Avatar className="h-16 w-16 ring-2 ring-primary/10">
                                <AvatarImage
                                    src={getAvatarUrl(appointment.patient?.profileImage?.fileUrl)}
                                    alt={appointment.patient?.name || "Patient"}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                                    {patientInitials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold">{appointment.patient?.name || "Patient"}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {appointment.patient?.emailAddress || "No email on file"}
                                </p>
                                {appointment.patient?.phoneNumber && (
                                    <p className="text-sm text-muted-foreground">{appointment.patient.phoneNumber}</p>
                                )}
                            </div>
                            <div className="sm:ml-auto flex flex-wrap items-center gap-2">
                                <StatusBadge variant={getStatusVariant(appointment.status || "scheduled")}>
                                    {appointment.status}
                                </StatusBadge>
                                <Badge
                                    variant={isPaid ? "secondary" : "outline"}
                                    className={
                                        isPaid
                                            ? "bg-emerald-600 text-white hover:bg-emerald-600"
                                            : "border-rose-200 text-rose-600"
                                    }
                                >
                                    {paymentLabel}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Visit Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            {appointment.notes ? <p>{appointment.notes}</p> : <p>No notes recorded.</p>}
                            {appointment.symptoms && <p>Symptoms: {appointment.symptoms}</p>}
                            {appointment.cancellationReason && (
                                <p>Cancellation Reason: {appointment.cancellationReason}</p>
                            )}
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
                                                    {test.report?.fileUrl && (
                                                        <a
                                                            href={getDiagnosticReportUrl(test.report.fileUrl)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="ml-2 text-xs text-primary underline-offset-4 hover:underline"
                                                        >
                                                            Download report
                                                        </a>
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

                <div className="space-y-4">
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Appointment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {start ? format(start, "MMMM d, yyyy") : "Date not set"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {start && end ? `${format(start, "h:mm a")} - ${format(end, "h:mm a")}` : ""}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" />
                                <span>Fee: Rs. {appointment.fee ?? 0}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {appointment.patient?.id && (
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link to={`/doctor/patient/${appointment.patient.id}`}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        View Patient Records
                                    </Link>
                                </Button>
                            )}
                            {appointment.status === AppointmentStatus.SCHEDULED && (
                                <Button className="w-full justify-start" asChild>
                                    <Link to={`/doctor/encounter/${appointment.id}`}>
                                        <Stethoscope className="h-4 w-4 mr-2" />
                                        Open Encounter
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
