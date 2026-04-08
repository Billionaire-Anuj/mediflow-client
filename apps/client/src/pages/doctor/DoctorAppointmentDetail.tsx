import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppointmentService, AppointmentStatus, DoctorService } from "@mediflow/mediflow-api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, getStatusVariant } from "@/components/ui/status-badge";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, CalendarClock, CheckCircle2, Clock, FileText, FlaskConical, Pill, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { combineDateAndTime } from "@/lib/datetime";
import { getEncounterWindowState } from "@/lib/encounter-window";
import { getAvatarUrl, getDiagnosticReportUrl } from "@/lib/auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getErrorMessage, getResponseMessage } from "@/lib/api";

export default function DoctorAppointmentDetail() {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>();
    const [selectedTimeslotId, setSelectedTimeslotId] = useState("");
    const [rescheduleNotes, setRescheduleNotes] = useState("");
    const [rescheduleSymptoms, setRescheduleSymptoms] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["appointment", appointmentId],
        enabled: !!appointmentId,
        queryFn: async () => AppointmentService.getAppointmentById({ appointmentId: appointmentId! })
    });

    const appointment = data?.result;
    const start = combineDateAndTime(appointment?.timeslot?.date, appointment?.timeslot?.startTime);
    const end = combineDateAndTime(appointment?.timeslot?.date, appointment?.timeslot?.endTime);
    const encounterWindow = getEncounterWindowState(start);
    const selectedDateString = rescheduleDate ? format(rescheduleDate, "yyyy-MM-dd") : "";
    const currentDateString = appointment?.timeslot?.date ? format(new Date(appointment.timeslot.date), "yyyy-MM-dd") : "";

    const { data: doctorTimeslotsData, isLoading: doctorTimeslotsLoading } = useQuery({
        queryKey: ["doctor-timeslots", selectedDateString],
        enabled: rescheduleDialogOpen && !!selectedDateString,
        queryFn: async () =>
            DoctorService.getDoctorTimeslots({
                startDate: selectedDateString,
                endDate: selectedDateString
            })
    });

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

    const openRescheduleDialog = () => {
        if (!appointment) return;

        const appointmentDate = combineDateAndTime(appointment.timeslot?.date, appointment.timeslot?.startTime) ?? new Date();
        setRescheduleDate(appointmentDate);
        setSelectedTimeslotId(appointment.timeslot?.id || "");
        setRescheduleNotes(appointment.notes || "");
        setRescheduleSymptoms(appointment.symptoms || "");
        setRescheduleDialogOpen(true);
    };

    useEffect(() => {
        if (!appointment) return;

        const appointmentDate = combineDateAndTime(appointment.timeslot?.date, appointment.timeslot?.startTime) ?? new Date();
        setRescheduleDate(appointmentDate);
        setSelectedTimeslotId(appointment.timeslot?.id || "");
        setRescheduleNotes(appointment.notes || "");
        setRescheduleSymptoms(appointment.symptoms || "");
    }, [appointment]);

    useEffect(() => {
        if (!appointment) return;

        if (selectedDateString === currentDateString) {
            setSelectedTimeslotId(appointment.timeslot?.id || "");
            return;
        }

        setSelectedTimeslotId("");
    }, [appointment, selectedDateString]);

    const rescheduleMutation = useMutation({
        mutationFn: async () =>
            AppointmentService.rescheduleAppointmentByDoctor({
                appointmentId: appointmentId!,
                requestBody: {
                    appointmentId: appointmentId!,
                    timeslotId: selectedTimeslotId,
                    notes: rescheduleNotes.trim() || null,
                    symptoms: rescheduleSymptoms.trim() || null
                }
            }),
        onSuccess: (response) => {
            toast.success(getResponseMessage(response));
            setRescheduleDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
            queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
        },
        onError: (error) => toast.error(getErrorMessage(error))
    });

    const timeslots = doctorTimeslotsData?.result ?? [];
    const selectedSlot = timeslots.find((slot) => slot.id === selectedTimeslotId);
    const availableTimeslots = timeslots.filter((slot) => !slot.isBooked || slot.id === appointment?.timeslot?.id);
    const unavailableTimeslots = timeslots.filter((slot) => !!slot.isBooked && slot.id !== appointment?.timeslot?.id);
    const selectedDateLabel = rescheduleDate ? format(rescheduleDate, "EEEE, MMMM d, yyyy") : "No date selected";
    const isCurrentDateSelected = selectedDateString !== "" && selectedDateString === currentDateString;
    const canReschedule = appointment?.status === AppointmentStatus.SCHEDULED && !!selectedTimeslotId;

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
                                <span>{start ? format(start, "MMMM d, yyyy") : "Date not set"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {start && end ? `${format(start, "h:mm a")} - ${format(end, "h:mm a")}` : ""}
                                </span>
                            </div>
                            {encounterWindow && (
                                <div className="flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4" />
                                    <span>
                                        Encounter Window: {format(encounterWindow.windowStart, "h:mm a")} -{" "}
                                        {format(encounterWindow.windowEnd, "h:mm a")}
                                    </span>
                                </div>
                            )}
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
                            {appointment.status === AppointmentStatus.SCHEDULED &&
                                (encounterWindow?.isWithinWindow ? (
                                    <Button className="w-full justify-start" asChild>
                                        <Link to={`/doctor/encounter/${appointment.id}`}>
                                            <Stethoscope className="h-4 w-4 mr-2" />
                                            Open Encounter
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button className="w-full justify-start" disabled>
                                        <Stethoscope className="h-4 w-4 mr-2" />
                                        {encounterWindow?.hasWindowNotStarted
                                            ? "Encounter Not Open Yet"
                                            : "Encounter Window Closed"}
                                    </Button>
                                ))}
                            {appointment.status === AppointmentStatus.SCHEDULED && encounterWindow && (
                                <p className="text-xs text-muted-foreground">{encounterWindow.helperText}</p>
                            )}
                            {appointment.status === AppointmentStatus.SCHEDULED && (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={openRescheduleDialog}
                                >
                                    <CalendarClock className="h-4 w-4 mr-2" />
                                    Reschedule Appointment
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Reschedule Appointment</DialogTitle>
                        <DialogDescription>
                            Choose a new date and available timeslot for this patient appointment.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">New Schedule</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <DatePicker
                                            value={rescheduleDate}
                                            onChange={(date) => setRescheduleDate(date as Date)}
                                            placeholder="Select a new date"
                                        />
                                    </div>
                                    <div className="rounded-2xl border bg-accent/30 p-4 text-sm text-muted-foreground">
                                        Current:
                                        <div className="mt-1 font-medium text-foreground">
                                            {start ? format(start, "MMM d, yyyy h:mm a") : "Not available"}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Timeslot</Label>
                                    {doctorTimeslotsLoading ? (
                                        <p className="text-sm text-muted-foreground">Loading timeslots...</p>
                                    ) : timeslots.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No timeslots are available for the selected date.
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/70 p-4">
                                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/80">
                                                            Selected schedule date
                                                        </p>
                                                        <p className="mt-1 text-base font-semibold text-foreground">
                                                            {selectedDateLabel}
                                                        </p>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            Available slots are shown first. Booked ones stay separate so the reschedule path is easier to scan.
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge variant="secondary" className="bg-white text-emerald-700">
                                                            {availableTimeslots.length} available
                                                        </Badge>
                                                        <Badge variant="secondary" className="bg-white text-rose-600">
                                                            {unavailableTimeslots.length} booked
                                                        </Badge>
                                                        {isCurrentDateSelected && (
                                                            <Badge variant="secondary" className="bg-white text-primary">
                                                                Current appointment date
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">Available slots</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Choose a free slot, or keep the current slot if it still works.
                                                        </p>
                                                    </div>
                                                    {selectedSlot && (
                                                        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            Selected:{" "}
                                                            {(() => {
                                                                const slotStart = combineDateAndTime(selectedSlot.date, selectedSlot.startTime);
                                                                const slotEnd = combineDateAndTime(selectedSlot.date, selectedSlot.endTime);
                                                                return slotStart && slotEnd
                                                                    ? `${format(slotStart, "h:mm a")} - ${format(slotEnd, "h:mm a")}`
                                                                    : "Timeslot selected";
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                                    {availableTimeslots.map((slot) => {
                                                        const slotStart = combineDateAndTime(slot.date, slot.startTime);
                                                        const slotEnd = combineDateAndTime(slot.date, slot.endTime);
                                                        const isCurrentSlot = slot.id === appointment.timeslot?.id;
                                                        const isSelected = selectedTimeslotId === slot.id;

                                                        return (
                                                            <button
                                                                key={slot.id}
                                                                type="button"
                                                                onClick={() => setSelectedTimeslotId(slot.id || "")}
                                                                className={cn(
                                                                    "rounded-2xl border px-4 py-4 text-left transition",
                                                                    isSelected
                                                                        ? "border-primary bg-primary/[0.08] shadow-sm ring-2 ring-primary/10"
                                                                        : "border-border bg-white hover:border-primary/40 hover:bg-accent/40"
                                                                )}
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div>
                                                                        <p className="text-lg font-semibold text-foreground">
                                                                            {slotStart ? format(slotStart, "h:mm a") : "Timeslot"}
                                                                        </p>
                                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                                            {slotEnd ? `Until ${format(slotEnd, "h:mm a")}` : "Available slot"}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex flex-col items-end gap-2">
                                                                        {isCurrentSlot && <Badge variant="secondary">Current</Badge>}
                                                                        {isSelected && (
                                                                            <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                                                                                Selected
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {unavailableTimeslots.length > 0 && (
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">Booked slots</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            These times are already taken on this day and are not available for rescheduling.
                                                        </p>
                                                    </div>
                                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                                        {unavailableTimeslots.map((slot) => {
                                                            const slotStart = combineDateAndTime(slot.date, slot.startTime);
                                                            const slotEnd = combineDateAndTime(slot.date, slot.endTime);

                                                            return (
                                                                <div
                                                                    key={slot.id}
                                                                    className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-4 text-rose-700"
                                                                >
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div>
                                                                            <p className="text-lg font-semibold">
                                                                                {slotStart ? format(slotStart, "h:mm a") : "Booked"}
                                                                            </p>
                                                                            <p className="mt-1 text-xs text-rose-600/80">
                                                                                {slotEnd ? `Until ${format(slotEnd, "h:mm a")}` : "Unavailable slot"}
                                                                            </p>
                                                                        </div>
                                                                        <Badge className="bg-rose-600 text-white hover:bg-rose-600">
                                                                            Booked
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Symptoms</Label>
                                    <Textarea
                                        value={rescheduleSymptoms}
                                        onChange={(event) => setRescheduleSymptoms(event.target.value)}
                                        placeholder="Update the patient symptoms if needed"
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={rescheduleNotes}
                                        onChange={(event) => setRescheduleNotes(event.target.value)}
                                        placeholder="Update appointment notes if needed"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-emerald-200 bg-gradient-to-b from-emerald-50 to-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">Reschedule Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="rounded-2xl border bg-white p-4">
                                    <p className="text-muted-foreground">Patient</p>
                                    <p className="mt-1 font-semibold">{appointment.patient?.name || "Patient"}</p>
                                </div>
                                <div className="rounded-2xl border bg-white p-4 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">New date</span>
                                        <span className="font-medium">
                                            {rescheduleDate ? format(rescheduleDate, "MMM d, yyyy") : "Not selected"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">New time</span>
                                        <span className="font-medium">
                                            {selectedSlot
                                                ? (() => {
                                                      const slotStart = combineDateAndTime(selectedSlot.date, selectedSlot.startTime);
                                                      const slotEnd = combineDateAndTime(selectedSlot.date, selectedSlot.endTime);
                                                      return slotStart && slotEnd
                                                          ? `${format(slotStart, "h:mm a")} - ${format(slotEnd, "h:mm a")}`
                                                          : "Selected";
                                                  })()
                                                : "Not selected"}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    The patient will receive an appointment update notification once you confirm the reschedule.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => rescheduleMutation.mutate()} disabled={!canReschedule || rescheduleMutation.isPending}>
                            {rescheduleMutation.isPending ? "Rescheduling..." : "Confirm Reschedule"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
